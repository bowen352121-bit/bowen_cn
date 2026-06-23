#!/usr/bin/env python3
"""
米游社 · 绝区零「咖啡馆」版块最新回复同步脚本
抓取帖子列表，下载头像与配图到本地，输出 mihoyo_data.json
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

API_URL = (
    "https://bbs-api.miyoushe.com/post/wapi/getForumPostList"
    "?forum_id=57&sort_type=1&is_good=false&page_size=10&page=1"
)
FORUM_ID = 57
GAME_ID = 8
LIMIT = 10
REPLIES_PER_POST = 6
MAX_SUB_REPLIES = 3
MAX_WORKERS = 6
# 米游社违规/删除占位图，不下载、不展示
VIOLATION_IMAGE_MARKERS = (
    "weigui.png",
    "weigui.webp",
    "/weigui",
    "shanchu.png",
    "shanchu.webp",
    "/shanchu",
)
SCRIPT_DIR = Path(__file__).resolve().parent
IMAGES_DIR = SCRIPT_DIR / "images" / "mihoyo"
ARCHIVE_DIR = SCRIPT_DIR / "archive"
OUTPUT_JSON = SCRIPT_DIR / "mihoyo_data.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.miyoushe.com/",
    "Accept": "application/json, text/plain, */*",
}


def log(msg: str) -> None:
    text = str(msg)
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        print(text.encode(enc, errors="replace").decode(enc, errors="replace"), flush=True)


def fetch_json(url: str, retries: int = 3) -> dict:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read()
            data = json.loads(raw.decode("utf-8"))
            if data.get("retcode") != 0:
                raise RuntimeError(
                    f"API retcode={data.get('retcode')} message={data.get('message')}"
                )
            return data
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as err:
            last_err = err
            if attempt + 1 < retries:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"request failed: {last_err}") from last_err


def ext_from_url(url: str, content_type: str = "") -> str:
    path = urllib.parse.urlparse(url).path.lower()
    for ext in (".webp", ".jpg", ".jpeg", ".png", ".gif"):
        if path.endswith(ext):
            return ext.lstrip(".")
    if "webp" in content_type:
        return "webp"
    if "jpeg" in content_type or "jpg" in content_type:
        return "jpg"
    if "png" in content_type:
        return "png"
    if "gif" in content_type:
        return "gif"
    return "jpg"


def safe_filename(prefix: str, url: str, index: int = 0) -> str:
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:12]
    ext = ext_from_url(url)
    suffix = f"_{index}" if index else ""
    return f"{prefix}{suffix}_{digest}.{ext}"


def download_image(url: str, dest: Path, retries: int = 2) -> Path | None:
    if not url or not url.startswith("http"):
        return None
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest

    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=25) as resp:
                content_type = resp.headers.get("Content-Type", "")
                data = resp.read()
            if not data:
                return None
            ext = ext_from_url(url, content_type)
            if dest.suffix.lower() not in {f".{ext}", ".webp", ".jpg", ".jpeg", ".png", ".gif"}:
                dest = dest.with_suffix(f".{ext}")
            dest.write_bytes(data)
            return dest
        except (urllib.error.URLError, TimeoutError, OSError) as err:
            last_err = err
            if attempt + 1 < retries:
                time.sleep(1.0)
    log(f"  ! download failed {url}: {last_err}")
    return None


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    return text.replace("\r\n", "\n").strip()


def build_post_url(post_id: str) -> str:
    return f"https://www.miyoushe.com/zzz/article/{post_id}"


def is_violation_image(url: str) -> bool:
    if not url:
        return False
    lower = url.lower()
    return any(marker in lower for marker in VIOLATION_IMAGE_MARKERS)


def filter_valid_images(urls: list[str]) -> list[str]:
    return [url for url in urls if url and not is_violation_image(url)]


def collect_image_urls(item: dict) -> list[str]:
    post = item.get("post") or {}
    image_urls: list[str] = []
    for img in item.get("image_list") or []:
        url = (img.get("url") or "").strip()
        if url and url not in image_urls and not is_violation_image(url):
            image_urls.append(url)
    for url in post.get("images") or []:
        url = (url or "").strip()
        if url and url not in image_urls and not is_violation_image(url):
            image_urls.append(url)
    cover = (post.get("cover") or "").strip()
    if cover and cover not in image_urls and not is_violation_image(cover):
        image_urls.insert(0, cover)
    return filter_valid_images(image_urls)[:9]


def parse_item(item: dict, downloaded: dict[str, str]) -> dict | None:
    post = item.get("post") or {}
    user = item.get("user") or {}
    stat = item.get("stat") or {}

    post_id = str(post.get("post_id") or "")
    if not post_id:
        return None

    nickname = (user.get("nickname") or "匿名用户").strip()
    avatar_url = (user.get("avatar_url") or "").strip()
    title = strip_html(post.get("subject") or "")
    content = strip_html(post.get("content") or "")
    reply_time = post.get("reply_time") or ""
    image_urls = collect_image_urls(item)

    avatar_local = downloaded.get(avatar_url, "") if avatar_url else ""
    images_local = [downloaded[url] for url in image_urls if url in downloaded]

    return {
        "post_id": post_id,
        "author": nickname,
        "avatar_url": avatar_url,
        "avatar_local": avatar_local,
        "title": title,
        "content": content,
        "reply_time": reply_time,
        "images_url": image_urls,
        "images_local": images_local,
        "views": int(stat.get("view_num") or 0),
        "replies": int(stat.get("reply_num") or 0),
        "likes": int(stat.get("like_num") or 0),
        "post_url": build_post_url(post_id),
    }


def build_replies_url(post_id: str) -> str:
    return (
        "https://bbs-api.miyoushe.com/post/wapi/getPostReplies"
        f"?post_id={post_id}&gids={GAME_ID}&size={REPLIES_PER_POST}&order_type=1&last_id=0"
    )


def parse_struct_content(text: str) -> str:
    if not text or not text.strip().startswith("["):
        return strip_html(text)
    try:
        parts = json.loads(text)
    except json.JSONDecodeError:
        return strip_html(text)
    chunks: list[str] = []
    for part in parts:
        if not isinstance(part, dict):
            continue
        if "insert" in part:
            insert = part["insert"]
            if isinstance(insert, str):
                chunks.append(insert)
    return strip_html("".join(chunks))


def collect_reply_image_urls(item: dict) -> list[str]:
    urls: list[str] = []
    for img in item.get("images") or []:
        url = (img.get("url") or "").strip()
        if url and url not in urls and not is_violation_image(url):
            urls.append(url)
    return filter_valid_images(urls)[:3]


def parse_reply_item(
    item: dict,
    post_id: str,
    downloaded: dict[str, str],
    *,
    is_sub: bool = False,
) -> dict | None:
    reply = item.get("reply") or {}
    user = item.get("user") or {}
    stat = item.get("stat") or {}

    reply_id = str(reply.get("reply_id") or "")
    if not reply_id:
        return None

    nickname = (user.get("nickname") or "匿名用户").strip()
    avatar_url = (user.get("avatar_url") or "").strip()
    content = strip_html(reply.get("content") or "")
    if not content:
        content = parse_struct_content(reply.get("struct_content") or "")

    image_urls = collect_reply_image_urls(item)
    avatar_local = downloaded.get(avatar_url, "") if avatar_url else ""
    images_local = [downloaded[url] for url in image_urls if url in downloaded]

    created_at = int(reply.get("created_at") or 0)
    if created_at:
        dt = datetime.fromtimestamp(created_at, tz=timezone.utc)
        time_label = dt.strftime("%m-%d %H:%M")
    else:
        time_label = ""

    return {
        "reply_id": reply_id,
        "post_id": post_id,
        "author": nickname,
        "avatar_url": avatar_url,
        "avatar_local": avatar_local,
        "content": content,
        "time": time_label,
        "is_sub": is_sub,
        "images_url": image_urls,
        "images_local": images_local,
        "likes": int(stat.get("like_num") or 0),
    }


def fetch_post_replies(post_id: str, downloaded: dict[str, str]) -> list[dict]:
    try:
        payload = fetch_json(build_replies_url(post_id))
    except Exception as err:
        log(f"  ! replies failed for {post_id}: {err}")
        return []

    raw_list = (payload.get("data") or {}).get("list") or []
    comments: list[dict] = []

    for item in raw_list[:REPLIES_PER_POST]:
        parsed = parse_reply_item(item, post_id, downloaded, is_sub=False)
        if parsed and (parsed["content"] or parsed["images_url"]):
            comments.append(parsed)
        for sub in (item.get("sub_replies") or [])[:MAX_SUB_REPLIES]:
            sub_parsed = parse_reply_item(sub, post_id, downloaded, is_sub=True)
            if sub_parsed and (sub_parsed["content"] or sub_parsed["images_url"]):
                comments.append(sub_parsed)

    return comments


def collect_download_jobs(raw_list: list[dict], posts: list[dict]) -> list[tuple[str, Path]]:
    jobs: list[tuple[str, Path]] = []
    seen: set[str] = set()

    for item in raw_list[:LIMIT]:
        post = item.get("post") or {}
        user = item.get("user") or {}
        post_id = str(post.get("post_id") or "")
        if not post_id:
            continue

        avatar_url = (user.get("avatar_url") or "").strip()
        if avatar_url and avatar_url not in seen:
            seen.add(avatar_url)
            jobs.append((avatar_url, IMAGES_DIR / safe_filename(f"avatar_{post_id}", avatar_url)))

        for idx, url in enumerate(collect_image_urls(item)):
            if url not in seen and not is_violation_image(url):
                seen.add(url)
                jobs.append((url, IMAGES_DIR / safe_filename(f"post_{post_id}", url, idx)))

    for post in posts:
        post_id = post.get("post_id") or "post"
        for comment in post.get("comments") or []:
            avatar_url = (comment.get("avatar_url") or "").strip()
            reply_id = comment.get("reply_id") or "reply"
            if avatar_url and avatar_url not in seen:
                seen.add(avatar_url)
                jobs.append(
                    (
                        avatar_url,
                        IMAGES_DIR / safe_filename(f"avatar_r_{reply_id}", avatar_url),
                    )
                )
            for idx, url in enumerate(comment.get("images_url") or []):
                if url and url not in seen and not is_violation_image(url):
                    seen.add(url)
                    jobs.append(
                        (
                            url,
                            IMAGES_DIR / safe_filename(f"reply_{reply_id}", url, idx),
                        )
                    )

    return jobs


def download_all(jobs: list[tuple[str, Path]]) -> dict[str, str]:
    downloaded: dict[str, str] = {}
    if not jobs:
        return downloaded

    log(f"downloading {len(jobs)} images …")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        future_map = {
            pool.submit(download_image, url, dest): url for url, dest in jobs
        }
        for future in as_completed(future_map):
            url = future_map[future]
            saved = future.result()
            if saved:
                downloaded[url] = f"images/mihoyo/{saved.name}"

    return downloaded


def apply_downloads_to_post(post: dict, downloaded: dict[str, str]) -> None:
    avatar_url = (post.get("avatar_url") or "").strip()
    if avatar_url and avatar_url in downloaded:
        post["avatar_local"] = downloaded[avatar_url]
    post["images_local"] = [
        downloaded[url] for url in (post.get("images_url") or []) if url in downloaded
    ]
    for comment in post.get("comments") or []:
        c_avatar = (comment.get("avatar_url") or "").strip()
        if c_avatar and c_avatar in downloaded:
            comment["avatar_local"] = downloaded[c_avatar]
        comment["images_local"] = [
            downloaded[url] for url in (comment.get("images_url") or []) if url in downloaded
        ]


def main() -> int:
    log(f"fetch MiHoYo cafe forum_id={FORUM_ID}")
    payload = fetch_json(API_URL)
    raw_list = (payload.get("data") or {}).get("list") or []
    if not raw_list:
        log("warning: empty API list")
        return 1

    posts: list[dict] = []
    for item in raw_list[:LIMIT]:
        parsed = parse_item(item, {})
        if not parsed:
            continue
        post_id = parsed["post_id"]
        log(f"  fetching replies for {post_id} …")
        parsed["comments"] = fetch_post_replies(post_id, {})
        posts.append(parsed)

    jobs = collect_download_jobs(raw_list, posts)
    downloaded = download_all(jobs)

    for post in posts:
        apply_downloads_to_post(post, downloaded)
        label = (post["title"] or post["content"])[:40]
        reply_count = len(post.get("comments") or [])
        log(f"  ok [{post['author']}] {label} ({reply_count} replies)")

    output = {
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source_api": API_URL,
        "forum_id": FORUM_ID,
        "forum_name": "咖啡馆",
        "game": "绝区零",
        "sort_type": 1,
        "sort_label": "最新回复",
        "count": len(posts),
        "posts": posts,
    }

    OUTPUT_JSON.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    day_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    archive_path = ARCHIVE_DIR / f"mihoyo_{day_key}.json"
    archive_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    log(f"saved {OUTPUT_JSON} ({len(posts)} items)")
    log(f"archived {archive_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
