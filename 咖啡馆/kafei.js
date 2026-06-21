/**
 * 咖啡馆 · 米游社风格帖子流（静态展示）
 */
const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  "#ff6a00",
  "#0284c7",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#06b6d4",
  "#6366f1",
  "#ef4444",
  "#84cc16",
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarInitial(name) {
  const trimmed = String(name).trim();
  if (!trimmed) return "?";
  const first = trimmed.charAt(0);
  return /[a-z]/i.test(first) ? first.toUpperCase() : first;
}

function renderAvatar(author) {
  const initial = avatarInitial(author);
  const color = avatarColor(author);
  return `<span class="cafe-post-avatar" style="background:${color}" aria-hidden="true">${escapeHtml(initial)}</span>`;
}

const POSTS = [
  {
    id: "pin-1",
    pinned: true,
    author: "BOWEN",
    time: "置顶",
    title: "【公告】咖啡馆社区版规",
    excerpt: "欢迎来到咖啡馆版块。请友善交流，禁止引战、广告与违规内容。骑士梦的讨论，从这里开始。",
    tags: ["公告"],
    views: 1280,
    comments: 42,
    likes: 88,
    images: [],
    sortNew: 100,
    sortReply: 100,
    sortHot: 100,
    link: "../bowen.html?read=0",
  },
  {
    id: "pin-2",
    pinned: true,
    author: "版务组",
    time: "置顶",
    title: "【Ver3.0】版主答疑&互助有奖TIME",
    excerpt: "有疑问可以在本帖留言，每周抽取周边。也欢迎分享你的配队与养成心得。",
    tags: ["互助"],
    views: 2340,
    comments: 156,
    likes: 320,
    images: [],
    sortNew: 99,
    sortReply: 99,
    sortHot: 99,
    link: "../bowen.html?read=6",
  },
  {
    id: "1",
    author: "子非鱼安知愚之乐",
    time: "06-14",
    title: "维丹这个队伍的保质期大概有多久？",
    excerpt: "想问问大家维丹队还能玩多久，资源有限想规划一下。",
    tags: ["绝区零", "配队"],
    views: 1342,
    comments: 258,
    likes: 64,
    images: ["../images/ZZZ3.0.2.jpg"],
    sortNew: 90,
    sortReply: 70,
    sortHot: 85,
    link: "https://www.miyoushe.com/zzz/article/76003722",
  },
  {
    id: "2",
    author: "续梦时华",
    time: "33分钟前",
    title: "榨干惹",
    excerpt: "角色76+7=83 专武62+71=133 总共216捏",
    tags: ["绝区零", "养成"],
    views: 54,
    comments: 14,
    likes: 8,
    images: ["../images/ZZZ3.0.1.jpg", "../images/比利SP1.jpg"],
    sortNew: 98,
    sortReply: 95,
    sortHot: 40,
    link: "https://www.miyoushe.com/zzz/article/76142094",
  },
  {
    id: "3",
    author: "ThatBarsarkar",
    time: "2小时前",
    title: "【绝区零同人】法厄同大人，那个女人是谁？",
    excerpt: "法厄同大人去了趟罗斯凯利法怎么身边多了这么多的人 薇薇安没有生气哦",
    tags: ["同人图", "哲", "薇薇安"],
    views: 314,
    comments: 22,
    likes: 56,
    images: ["../images/ZZZzhe.jpg"],
    sortNew: 85,
    sortReply: 80,
    sortHot: 78,
    link: "https://www.miyoushe.com/zzz/home/57?type=2",
  },
  {
    id: "4",
    author: "早八开拓者",
    time: "06-19",
    title: "现在绝区零大毕业要多少词条",
    excerpt: "看见一些低金凹视频说「仅36词条」我最好的也只有35词条",
    tags: ["每日一水", "绝区零"],
    views: 960,
    comments: 155,
    likes: 120,
    images: [],
    sortNew: 75,
    sortReply: 60,
    sortHot: 92,
    link: "https://www.miyoushe.com/zzz/home/57?type=2",
  },
  {
    id: "5",
    author: "念北风小可爱",
    time: "06-17",
    title: "\"优雅永不过时\"【维琳娜】",
    excerpt: "01:01 剪辑向，欢迎来咖啡馆一起聊代理人。",
    tags: ["绝区零激励计划", "维琳娜"],
    views: 3264,
    comments: 37,
    likes: 280,
    images: ["../images/jqlzy.jpg"],
    sortNew: 70,
    sortReply: 55,
    sortHot: 98,
    link: "https://www.miyoushe.com/zzz/home/57?type=2",
  },
  {
    id: "6",
    author: "神肝bt",
    time: "22小时前",
    title: "蕾米埃尔",
    excerpt: "新代理人手感不错，来咖啡馆唠唠配队。",
    tags: ["绝区零", "蕾米埃尔"],
    views: 79,
    comments: 12,
    likes: 15,
    images: ["../images/ZZZ3.0.3.jpg"],
    sortNew: 88,
    sortReply: 88,
    sortHot: 45,
    link: "https://www.miyoushe.com/zzz/article/76123519",
  },
  {
    id: "7",
    author: "凉风慕槿鱺",
    time: "19小时前",
    title: "放假的云绝区零现状",
    excerpt: "感觉排一天都进不去，云玩家集合。",
    tags: ["绝区零"],
    views: 43,
    comments: 12,
    likes: 6,
    images: [],
    sortNew: 82,
    sortReply: 75,
    sortHot: 35,
    link: "https://www.miyoushe.com/zzz/home/57?type=2",
  },
  {
    id: "8",
    author: "不秋silkysaw",
    time: "22小时前",
    title: "蕾米埃尔这属性是变种风吧？",
    excerpt: "看机制有点意思，大家怎么看数值？",
    tags: ["绝区零激励计划", "维琳娜"],
    views: 222,
    comments: 78,
    likes: 44,
    images: [],
    sortNew: 80,
    sortReply: 72,
    sortHot: 68,
    link: "https://www.miyoushe.com/zzz/article/76123818",
  },
  {
    id: "9",
    author: "阿烬Lan",
    time: "1小时前",
    title: "想回游 不知道我0+1的雅还能用不",
    excerpt: "老号想捡起来，求助大佬指点。",
    tags: ["绝区零", "回游"],
    views: 79,
    comments: 15,
    likes: 9,
    images: ["../images/骑士梦1.jpg"],
    sortNew: 92,
    sortReply: 90,
    sortHot: 50,
    link: "https://www.miyoushe.com/zzz/article/76144010",
  },
  {
    id: "10",
    author: "泡泡没有岛屿",
    time: "1小时前",
    title: "诺姆炒鸡炒鸡可爱，官方会出手办把捏",
    excerpt: "真的太可爱了，希望周边快点上。",
    tags: ["绝区零"],
    views: 33,
    comments: 2,
    likes: 5,
    images: ["../images/牢真.jpg"],
    sortNew: 86,
    sortReply: 84,
    sortHot: 30,
    link: "https://www.miyoushe.com/zzz/article/76144131",
  },
];

let currentSort = "newest";
let displayedCount = PAGE_SIZE;

const feedEl = document.getElementById("cafe-feed");
const loadMoreBtn = document.getElementById("btn-load-more");
const sortBtns = document.querySelectorAll(".cafe-sort-btn");
const publishBtn = document.getElementById("btn-publish-hint");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sortNormalPosts(posts) {
  const normal = posts.filter((p) => !p.pinned);

  if (currentSort === "newest") {
    normal.sort((a, b) => b.sortNew - a.sortNew);
  } else if (currentSort === "reply") {
    normal.sort((a, b) => b.sortReply - a.sortReply);
  } else {
    normal.sort((a, b) => b.sortHot - a.sortHot);
  }

  return normal;
}

function renderPinnedBlock(pinned) {
  if (!pinned.length) return null;

  const block = document.createElement("div");
  block.className = "cafe-pinned";
  block.innerHTML =
    '<ul class="cafe-pinned-list">' +
    pinned
      .map(
        (post) =>
          `<li class="cafe-pinned-item">
            <a href="${escapeHtml(post.link)}">
              <span class="cafe-pin-tag">置顶</span>
              <span class="cafe-pinned-title">${escapeHtml(post.title)}</span>
            </a>
          </li>`
      )
      .join("") +
    "</ul>";

  return block;
}

function renderImages(images) {
  if (!images?.length) return "";
  const cls = images.length === 1 ? "single" : images.length === 2 ? "double" : "multi";
  const thumbs = images
    .slice(0, 3)
    .map((src) => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`)
    .join("");
  const more = images.length > 3 ? `<span class="cafe-img-more">+${images.length - 3}</span>` : "";
  return `<div class="cafe-post-images ${cls}">${thumbs}${more}</div>`;
}

function renderPost(post) {
  const article = document.createElement("article");
  article.className = "cafe-post";

  const tags = post.tags
    .map((t) => `<span class="cafe-post-tag">${escapeHtml(t)}</span>`)
    .join("");

  article.innerHTML = `
    <div class="cafe-post-head">
      ${renderAvatar(post.author)}
      <div class="cafe-post-meta">
        <span class="cafe-post-author">${escapeHtml(post.author)}</span>
        <span class="cafe-post-time">${escapeHtml(post.time)}</span>
        <span class="cafe-post-game">· 绝区零</span>
      </div>
    </div>
    <a class="cafe-post-body" href="${escapeHtml(post.link)}" target="_blank" rel="noopener">
      <h3 class="cafe-post-title">${escapeHtml(post.title)}</h3>
      ${post.excerpt ? `<p class="cafe-post-excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      ${renderImages(post.images)}
      ${tags ? `<div class="cafe-post-tags">${tags}</div>` : ""}
    </a>
    <div class="cafe-post-foot">
      <span class="cafe-stat" title="评论">💬 ${post.comments}</span>
      <span class="cafe-stat" title="浏览">👁 ${post.views}</span>
      <span class="cafe-stat" title="点赞">♥ ${post.likes}</span>
    </div>
  `;

  return article;
}

function renderFeed() {
  const pinned = POSTS.filter((p) => p.pinned);
  const normal = sortNormalPosts(POSTS);
  const slice = normal.slice(0, displayedCount);

  feedEl.replaceChildren();

  const pinnedBlock = renderPinnedBlock(pinned);
  if (pinnedBlock) feedEl.appendChild(pinnedBlock);

  slice.forEach((post) => feedEl.appendChild(renderPost(post)));
  loadMoreBtn.classList.toggle("hidden", displayedCount >= normal.length);
}

sortBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentSort = btn.dataset.sort;
    sortBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
    displayedCount = PAGE_SIZE;
    renderFeed();
  });
});

loadMoreBtn?.addEventListener("click", () => {
  displayedCount += PAGE_SIZE;
  renderFeed();
});

publishBtn?.addEventListener("click", () => {
  alert("本地演示站暂未接入发帖功能。可到米游社咖啡馆发布，或前往景教留言板互动。");
});

renderFeed();
