/**
 * 咖啡馆 · 米游社风格帖子流 + Firebase 发帖
 */
import { firebaseConfig, isFirebaseReady } from "../景教/firebase-config.js";
import { loadFirebaseSdk } from "../景教/firebase-sdk.js";

const PAGE_SIZE = 8;
const FIRESTORE_COLLECTION = "cafe_posts";
const CAFE_LIKES_COLLECTION = "cafe_likes";
const CAFE_VIEWS_COLLECTION = "cafe_views";
const MIHOYO_VIOLATION_IMAGE_RE = /weigui|shanchu|违规/i;

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

function renderAvatarHtml(author, avatarUrl) {
  if (avatarUrl) {
    return `<img class="cafe-post-avatar-img" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(author)}的头像" loading="lazy">`;
  }
  return renderAvatar(author);
}

const STATIC_POSTS = [
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
  },
];

let auth = null;
let db = null;

let initializeApp;
let getApps;
let getAuth;
let onAuthStateChanged;
let getFirestore;
let collection;
let addDoc;
let query;
let orderBy;
let onSnapshot;
let serverTimestamp;
let doc;
let getDoc;
let setDoc;
let runTransaction;
let increment;

function bindFirebaseApi(sdk) {
  ({
    initializeApp,
    getApps,
    getAuth,
    onAuthStateChanged,
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    runTransaction,
    increment,
  } = sdk);
}
let currentUser = null;
let dynamicPosts = [];
let postsUnsubscribe = null;
let likesUnsubscribe = null;
let viewsUnsubscribe = null;
let isSubmitting = false;
let mihoyoPosts = [];
const extraLikeCounts = {};
const extraViewCounts = {};
const userLikedKeys = new Set();
let viewCountArmed = false;
let viewCountFlushed = false;
let viewTrackingSetup = false;

let currentSort = "newest";
let displayedCount = PAGE_SIZE;

const feedEl = document.getElementById("cafe-feed");
const loadMoreBtn = document.getElementById("btn-load-more");
const sortBtns = document.querySelectorAll(".cafe-sort-btn");
const publishBtn = document.getElementById("btn-publish-hint");
const cafeLightbox = document.getElementById("cafe-image-lightbox");
const cafeLightboxImg = document.querySelector("#cafe-image-lightbox .cafe-lightbox-img");
const cafeLightboxClose = document.querySelector("#cafe-image-lightbox .cafe-lightbox-close");
const guestModal = document.getElementById("cafe-guest-modal");
const guestCancelBtn = document.getElementById("cafe-guest-cancel");
const composeModal = document.getElementById("cafe-compose-modal");
const composeForm = document.getElementById("cafe-compose-form");
const composeCloseBtn = document.getElementById("cafe-compose-close");
const composeCancelBtn = document.getElementById("cafe-compose-cancel");
const composeSubmitBtn = document.getElementById("cafe-compose-submit");
const titleInput = document.getElementById("cafe-post-title");
const excerptInput = document.getElementById("cafe-post-excerpt");
const tagsInput = document.getElementById("cafe-post-tags");
const imagesInput = document.getElementById("cafe-post-images");
const mihoyoFeedEl = document.getElementById("cafe-mihoyo-feed");
const mihoyoEmptyEl = document.getElementById("cafe-mihoyo-empty");
const mihoyoSyncEl = document.getElementById("cafe-mihoyo-sync");
const mihoyoRefreshBtn = document.getElementById("btn-mihoyo-refresh");
const MIHOYO_REFRESH_MS = 5 * 60 * 1000;
let mihoyoFetchedAt = "";
let mihoyoPostCount = 0;
let mihoyoRefreshTimer = 0;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getDisplayName(user) {
  if (!user) return "用户";
  if (user.displayName?.trim()) return user.displayName.trim();

  const provider = user.providerData?.[0];
  if (provider?.displayName?.trim()) return provider.displayName.trim();

  if (user.email?.includes("@")) return user.email.split("@")[0];

  return "用户";
}

function formatPostTime(date) {
  if (!date || Number.isNaN(date.getTime())) return "刚刚";

  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return null;
}

function mapFirestorePost(id, data) {
  const createdAt = timestampToDate(data.createdAt);
  const createdMs = createdAt?.getTime() || Date.now();
  const views = Number(data.views) || 0;
  const comments = Number(data.comments) || 0;
  const likes = Number(data.likes) || 0;

  return {
    id,
    pinned: false,
    author: data.author || "用户",
    time: formatPostTime(createdAt),
    title: data.title || "",
    excerpt: data.excerpt || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    views,
    comments,
    likes,
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
    sortNew: createdMs,
    sortReply: comments,
    sortHot: likes * 3 + comments * 2 + Math.floor(views / 10),
    likeKey: `local_${id}`,
  };
}

function getAllPosts() {
  return [...STATIC_POSTS, ...dynamicPosts];
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
              <span class="cafe-pin-tag">置顶</span>
              <span class="cafe-pinned-title">${escapeHtml(post.title)}</span>
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
    .map((src) => `<img class="cafe-post-img" src="${escapeHtml(src)}" alt="帖子配图" loading="lazy">`)
    .join("");
  const more = images.length > 3 ? `<span class="cafe-img-more">+${images.length - 3}</span>` : "";
  return `<div class="cafe-post-images ${cls}">${thumbs}${more}</div>`;
}

const CAFE_STAT_ICONS = {
  comment:
    '<svg class="cafe-stat-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.25 3.75A1.25 1.25 0 013.5 2.5h9a1.25 1.25 0 011.25 1.25v5.5A1.25 1.25 0 0112.5 10.5H6.6L4 12.75v-2.25H3.5a1.25 1.25 0 01-1.25-1.25v-5.5z" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>',
  view:
    '<svg class="cafe-stat-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4.25c2.45 0 4.55 1.45 5.65 3.75-1.1 2.3-3.2 3.75-5.65 3.75S3.45 10.3 2.35 8c1.1-2.3 3.2-3.75 5.65-3.75z" fill="none" stroke="currentColor" stroke-width="1.15"/><circle cx="8" cy="8" r="1.65" fill="none" stroke="currentColor" stroke-width="1.15"/></svg>',
  like:
    '<svg class="cafe-stat-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.5S2.75 10.2 2.75 6.45c0-1.55 1.25-2.8 2.8-2.8.95 0 1.8.48 2.25 1.22.45-.74 1.3-1.22 2.25-1.22 1.55 0 2.8 1.25 2.8 2.8C13.25 10.2 8 13.5 8 13.5z" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>',
};

function formatStatNum(n) {
  const num = Number(n) || 0;
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, "")}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(num);
}

function getTotalLikes(baseLikes, likeKey) {
  const base = Number(baseLikes) || 0;
  if (!likeKey) return base;
  return base + (extraLikeCounts[likeKey] || 0);
}

function getTotalViews(baseViews, viewKey) {
  const base = Number(baseViews) || 0;
  if (!viewKey) return base;
  return base + (extraViewCounts[viewKey] || 0);
}

function getMihoyoStatKey(post) {
  if (!post?.post_id) return null;
  return `mihoyo_${post.post_id}`;
}

function getMihoyoLikeKey(post) {
  return getMihoyoStatKey(post);
}

function renderStat(kind, value) {
  const labels = { comment: "评论", view: "浏览", like: "点赞" };
  const icon = CAFE_STAT_ICONS[kind] || "";
  const num = formatStatNum(value);
  return `<span class="cafe-stat cafe-stat--${kind}" title="${labels[kind] || ""}">${icon}<span class="cafe-stat-num">${num}</span></span>`;
}

function renderCommentToggle(value, targetId) {
  const icon = CAFE_STAT_ICONS.comment;
  const num = formatStatNum(value);
  return `<button type="button" class="cafe-stat cafe-stat--comment cafe-reply-toggle" data-reply-target="${escapeHtml(targetId)}" aria-expanded="false" title="展开回复">${icon}<span class="cafe-stat-num">${num}</span></button>`;
}

function renderViewStat(baseViews, viewKey) {
  const total = getTotalViews(baseViews, viewKey);
  const icon = CAFE_STAT_ICONS.view;
  return `<span class="cafe-stat cafe-stat--view" data-view-key="${escapeHtml(viewKey)}" data-base-views="${Number(baseViews) || 0}" title="浏览">${icon}<span class="cafe-stat-num">${formatStatNum(total)}</span></span>`;
}

function renderPostFoot(stats, options = {}) {
  const {
    extraHtml = "",
    className = "cafe-post-foot",
    likeKey = null,
    liked = false,
    viewKey = null,
    commentToggleTarget = null,
  } = options;
  const commentHtml = commentToggleTarget
    ? renderCommentToggle(stats.comments, commentToggleTarget)
    : renderStat("comment", stats.comments);
  const viewHtml = viewKey ? renderViewStat(stats.views, viewKey) : renderStat("view", stats.views);
  const likeHtml = likeKey
    ? renderLikeStat(stats.likes, likeKey, liked)
    : renderStat("like", stats.likes);
  return `<div class="${className}">${commentHtml}${viewHtml}${likeHtml}${extraHtml}</div>`;
}

function renderReplyImages(images) {
  if (!images?.length) return "";
  const thumbs = images
    .slice(0, 2)
    .map((src) => `<img class="cafe-reply-img" src="${escapeHtml(src)}" alt="回复配图" loading="lazy">`)
    .join("");
  return `<div class="cafe-reply-images">${thumbs}</div>`;
}

function formatMihoyoSyncLabel(iso, count) {
  if (!iso) return "米游社评论尚未同步";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return count ? `米游社评论已同步 · 共 ${count} 条` : "米游社评论已同步";
  }
  const local = dt.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const countLabel = count ? ` · 共 ${count} 条` : "";
  return `米游社评论同步于 ${local}${countLabel}`;
}

function updateMihoyoSyncLabel() {
  if (!mihoyoSyncEl) return;
  mihoyoSyncEl.textContent = formatMihoyoSyncLabel(mihoyoFetchedAt, mihoyoPostCount);
}

function renderReplyItem(comment) {
  const avatar = comment.avatar_local || comment.avatar_url;
  const cls = comment.is_sub ? "cafe-reply cafe-reply--sub" : "cafe-reply";
  return `<div class="${cls}">
    <div class="cafe-reply-head">
      ${renderAvatarHtml(comment.author, avatar)}
      <div class="cafe-reply-meta">
        <span class="cafe-reply-author">${escapeHtml(comment.author)}</span>
        ${comment.time ? `<span class="cafe-reply-time">${escapeHtml(comment.time)}</span>` : ""}
      </div>
    </div>
    ${comment.content ? `<p class="cafe-reply-content">${escapeHtml(comment.content)}</p>` : ""}
    ${renderReplyImages(comment.images_local)}
  </div>`;
}

function renderLikeStat(baseLikes, likeKey, liked) {
  const total = getTotalLikes(baseLikes, likeKey);
  const icon = CAFE_STAT_ICONS.like;
  return `<button type="button" class="cafe-stat cafe-stat--like cafe-like-btn${liked ? " is-liked" : ""}" data-like-key="${escapeHtml(likeKey)}" data-base-likes="${Number(baseLikes) || 0}" title="点赞" aria-pressed="${liked ? "true" : "false"}"${liked ? " disabled" : ""}>${icon}<span class="cafe-stat-num">${formatStatNum(total)}</span></button>`;
}

function renderReplies(comments, targetId) {
  if (!comments?.length || !targetId) return "";
  return `<div class="cafe-replies" id="${escapeHtml(targetId)}" hidden>${comments.map(renderReplyItem).join("")}</div>`;
}

function toggleReplyPanel(btn) {
  const panel = document.getElementById(btn.dataset.replyTarget || "");
  if (!panel) return;
  const open = panel.hidden;
  panel.hidden = !open;
  btn.classList.toggle("is-open", open);
  btn.setAttribute("aria-expanded", open ? "true" : "false");
  btn.title = open ? "收起回复" : "展开回复";
}

function updateLikeCountsInDom() {
  document.querySelectorAll(".cafe-like-btn").forEach((btn) => {
    const key = btn.dataset.likeKey;
    if (!key) return;
    const base = Number(btn.dataset.baseLikes) || 0;
    const numEl = btn.querySelector(".cafe-stat-num");
    if (numEl) numEl.textContent = formatStatNum(getTotalLikes(base, key));
    const liked = userLikedKeys.has(key);
    btn.classList.toggle("is-liked", liked);
    btn.disabled = liked;
    btn.setAttribute("aria-pressed", liked ? "true" : "false");
  });
}

function updateViewCountsInDom() {
  document.querySelectorAll(".cafe-stat--view[data-view-key]").forEach((el) => {
    const key = el.dataset.viewKey;
    if (!key) return;
    const base = Number(el.dataset.baseViews) || 0;
    const numEl = el.querySelector(".cafe-stat-num");
    if (numEl) numEl.textContent = formatStatNum(getTotalViews(base, key));
  });
}

async function loadUserLikedKeys(keys) {
  if (!currentUser || !db || !keys.length) return;
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  await Promise.all(
    uniqueKeys.map(async (key) => {
      const snap = await getDoc(doc(db, CAFE_LIKES_COLLECTION, key, "voters", currentUser.uid));
      if (snap.exists()) userLikedKeys.add(key);
    })
  );
}

async function likePost(postKey) {
  if (!postKey) return;
  if (!currentUser) {
    openGuestModal();
    return;
  }
  if (!db) return;
  if (userLikedKeys.has(postKey)) return;

  const likeRef = doc(db, CAFE_LIKES_COLLECTION, postKey);
  const voterRef = doc(db, CAFE_LIKES_COLLECTION, postKey, "voters", currentUser.uid);

  try {
    await runTransaction(db, async (transaction) => {
      const voterSnap = await transaction.get(voterRef);
      if (voterSnap.exists()) return;
      transaction.set(voterRef, { at: serverTimestamp() });
      transaction.set(likeRef, { count: increment(1) }, { merge: true });
    });
    userLikedKeys.add(postKey);
    updateLikeCountsInDom();
  } catch (err) {
    console.error("点赞失败：", err);
  }
}

function subscribeLikes() {
  if (!db) return;
  likesUnsubscribe?.();
  likesUnsubscribe = onSnapshot(
    collection(db, CAFE_LIKES_COLLECTION),
    (snapshot) => {
      Object.keys(extraLikeCounts).forEach((key) => delete extraLikeCounts[key]);
      snapshot.docs.forEach((docSnap) => {
        extraLikeCounts[docSnap.id] = Number(docSnap.data().count) || 0;
      });
      updateLikeCountsInDom();
    },
    (err) => console.error("加载点赞数据失败：", err)
  );
}

function subscribeViews() {
  if (!db) return;
  viewsUnsubscribe?.();
  viewsUnsubscribe = onSnapshot(
    collection(db, CAFE_VIEWS_COLLECTION),
    (snapshot) => {
      Object.keys(extraViewCounts).forEach((key) => delete extraViewCounts[key]);
      snapshot.docs.forEach((docSnap) => {
        extraViewCounts[docSnap.id] = Number(docSnap.data().count) || 0;
      });
      updateViewCountsInDom();
    },
    (err) => console.error("加载浏览数据失败：", err)
  );
}

function collectStatKeys() {
  const keys = mihoyoPosts.map(getMihoyoStatKey).filter(Boolean);
  dynamicPosts.forEach((post) => {
    if (post.likeKey) keys.push(post.likeKey);
  });
  return [...new Set(keys)];
}

function collectLikeKeys() {
  return collectStatKeys();
}

function armViewCount() {
  viewCountArmed = true;
}

async function recordPageViews() {
  if (!db || viewCountFlushed || !viewCountArmed) return;

  const keys = collectStatKeys();
  if (!keys.length) return;

  viewCountFlushed = true;
  try {
    await Promise.all(
      keys.map((key) =>
        setDoc(doc(db, CAFE_VIEWS_COLLECTION, key), { count: increment(1) }, { merge: true })
      )
    );
  } catch (err) {
    viewCountFlushed = false;
    console.error("浏览计数失败：", err);
  }
}

function setupViewTracking() {
  armViewCount();
  if (viewTrackingSetup) return;
  viewTrackingSetup = true;
  const flush = () => {
    recordPageViews();
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

function renderPost(post) {
  const article = document.createElement("article");
  article.className = "cafe-post";

  article.innerHTML = `
    <div class="cafe-post-head">
      ${renderAvatarHtml(post.author, post.avatarUrl)}
      <div class="cafe-post-meta">
        <span class="cafe-post-author">${escapeHtml(post.author)}</span>
        <span class="cafe-post-time">${escapeHtml(post.time)}</span>
        <span class="cafe-post-game">· 绝区零</span>
      </div>
    </div>
    <div class="cafe-post-body">
      <h3 class="cafe-post-title">${escapeHtml(post.title)}</h3>
      ${post.excerpt ? `<p class="cafe-post-excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      ${renderImages(post.images)}
    </div>
    ${renderPostFoot(
      { comments: post.comments, views: post.views, likes: post.likes },
      {
        likeKey: post.likeKey || null,
        liked: post.likeKey ? userLikedKeys.has(post.likeKey) : false,
        viewKey: post.likeKey || null,
      }
    )}
  `;

  return article;
}

function filterMihoyoImages(post) {
  const urls = Array.isArray(post.images_url) ? post.images_url : [];
  const locals = Array.isArray(post.images_local) ? post.images_local : [];
  if (!locals.length) return [];

  if (!urls.length) {
    return locals.filter((src) => src && !MIHOYO_VIOLATION_IMAGE_RE.test(src));
  }

  return locals.filter((src, index) => {
    if (!src) return false;
    const url = urls[index] || "";
    return !MIHOYO_VIOLATION_IMAGE_RE.test(url) && !MIHOYO_VIOLATION_IMAGE_RE.test(src);
  });
}

function renderMihoyoPost(post) {
  const article = document.createElement("article");
  article.className = "cafe-post cafe-mihoyo-post";

  const title = post.title || "";
  const excerpt = post.content || "";
  const images = filterMihoyoImages(post);
  const timeLabel = post.reply_time || "刚刚";
  const likeKey = getMihoyoStatKey(post);
  const liked = likeKey ? userLikedKeys.has(likeKey) : false;
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const replyCount = Number(post.replies) || comments.length || 0;
  const replyTargetId = comments.length || replyCount > 0 ? `cafe-replies-${post.post_id}` : null;

  article.innerHTML = `
    <div class="cafe-post-head">
      ${renderAvatarHtml(post.author, post.avatar_local || post.avatar_url)}
      <div class="cafe-post-meta">
        <span class="cafe-post-author">${escapeHtml(post.author)}</span>
        <span class="cafe-post-time">${escapeHtml(timeLabel)}</span>
        <span class="cafe-post-game">· 绝区零</span>
      </div>
    </div>
    <div class="cafe-post-body">
      ${title ? `<h3 class="cafe-post-title">${escapeHtml(title)}</h3>` : ""}
      ${excerpt ? `<p class="cafe-post-excerpt">${escapeHtml(excerpt)}</p>` : ""}
      ${renderImages(images)}
    </div>
    ${renderPostFoot(
      { comments: replyCount, views: post.views ?? 0, likes: post.likes ?? 0 },
      {
        className: "cafe-post-foot cafe-mihoyo-foot",
        likeKey,
        liked,
        viewKey: likeKey,
        commentToggleTarget: replyTargetId,
      }
    )}
    ${renderReplies(comments, replyTargetId)}
  `;

  return article;
}

function renderMihoyoFeed() {
  if (!mihoyoFeedEl) return;
  mihoyoFeedEl.replaceChildren();
  mihoyoPosts.forEach((post) => mihoyoFeedEl.appendChild(renderMihoyoPost(post)));
  updateLikeCountsInDom();
  updateViewCountsInDom();
}

async function loadMihoyoFeed(options = {}) {
  if (!mihoyoFeedEl) return;
  const { silent = false } = options;

  if (!silent && mihoyoRefreshBtn) {
    mihoyoRefreshBtn.disabled = true;
    mihoyoRefreshBtn.textContent = "刷新中…";
  }

  try {
    const resp = await fetch(`mihoyo_data.json?_=${Date.now()}`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    mihoyoFetchedAt = data.fetched_at || "";
    mihoyoPostCount = Number(data.count) || posts.length;
    updateMihoyoSyncLabel();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    if (!posts.length) {
      mihoyoFeedEl.replaceChildren();
      mihoyoEmptyEl?.classList.remove("hidden");
      return;
    }

    mihoyoEmptyEl?.classList.add("hidden");
    mihoyoPosts = posts;
    await loadUserLikedKeys(collectLikeKeys());
    renderMihoyoFeed();
    subscribeLikes();
    subscribeViews();
    setupViewTracking();
  } catch (err) {
    console.warn("米游社数据加载失败：", err);
    mihoyoFeedEl.replaceChildren();
    mihoyoEmptyEl?.classList.remove("hidden");
    if (mihoyoSyncEl) {
      mihoyoSyncEl.textContent = "米游社评论加载失败，请稍后重试";
    }
  } finally {
    if (mihoyoRefreshBtn) {
      mihoyoRefreshBtn.disabled = false;
      mihoyoRefreshBtn.textContent = "刷新评论";
    }
  }
}

function scheduleMihoyoRefresh() {
  clearInterval(mihoyoRefreshTimer);
  mihoyoRefreshTimer = window.setInterval(() => {
    if (document.hidden) return;
    loadMihoyoFeed({ silent: true });
  }, MIHOYO_REFRESH_MS);
}

function renderFeed() {
  const pinned = getAllPosts().filter((p) => p.pinned);
  const normal = sortNormalPosts(getAllPosts());
  const slice = normal.slice(0, displayedCount);

  feedEl.replaceChildren();

  const pinnedBlock = renderPinnedBlock(pinned);
  if (pinnedBlock) feedEl.appendChild(pinnedBlock);

  slice.forEach((post) => feedEl.appendChild(renderPost(post)));
  loadMoreBtn.classList.toggle("hidden", displayedCount >= normal.length);
}

function updateBodyScrollLock() {
  const anyOpen =
    (cafeLightbox && !cafeLightbox.classList.contains("hidden")) ||
    (composeModal && !composeModal.classList.contains("hidden")) ||
    (guestModal && !guestModal.classList.contains("hidden"));
  document.body.style.overflow = anyOpen ? "hidden" : "";
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.hidden = false;
  updateBodyScrollLock();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.hidden = true;
  updateBodyScrollLock();
}

function resetComposeForm() {
  composeForm?.reset();
}

function openGuestModal() {
  openModal(guestModal);
}

function closeGuestModal() {
  closeModal(guestModal);
}

function openComposeModal() {
  resetComposeForm();
  openModal(composeModal);
  titleInput?.focus();
}

function closeComposeModal() {
  closeModal(composeModal);
}

function parseTags(raw) {
  return raw
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseImageUrls(raw) {
  return raw
    .split(/\n|,|，/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))
    .slice(0, 3);
}

async function submitPost(event) {
  event.preventDefault();
  if (isSubmitting || !db || !currentUser) return;

  const title = titleInput.value.trim();
  const excerpt = excerptInput.value.trim();
  const tags = parseTags(tagsInput.value);
  const images = parseImageUrls(imagesInput.value);

  if (!title) {
    alert("请填写标题。");
    titleInput.focus();
    return;
  }
  if (!excerpt) {
    alert("请填写正文。");
    excerptInput.focus();
    return;
  }

  isSubmitting = true;
  composeSubmitBtn.disabled = true;
  composeSubmitBtn.textContent = "发布中…";

  try {
    await addDoc(collection(db, FIRESTORE_COLLECTION), {
      uid: currentUser.uid,
      author: getDisplayName(currentUser),
      title,
      excerpt,
      tags,
      images,
      views: 0,
      comments: 0,
      likes: 0,
      createdAt: serverTimestamp(),
    });

    closeComposeModal();
    resetComposeForm();
    currentSort = "newest";
    sortBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.sort === "newest"));
    displayedCount = PAGE_SIZE;
  } catch (err) {
    console.error("发帖失败：", err);
    const msg =
      err.code === "permission-denied"
        ? "发帖被拒绝：请确认已在景教登录，且 Firestore 规则已部署。"
        : err.message || "未知错误";
    alert("发帖失败：" + msg);
  } finally {
    isSubmitting = false;
    composeSubmitBtn.disabled = false;
    composeSubmitBtn.textContent = "发布";
  }
}

async function initFirebase() {
  if (!isFirebaseReady()) {
    console.warn("Firebase 未配置，咖啡馆仅展示静态帖子。");
    return;
  }

  const sdk = await loadFirebaseSdk();
  if (!sdk) {
    console.warn("Firebase SDK 加载失败，咖啡馆仅展示本地帖子。");
    return;
  }
  bindFirebaseApi(sdk);

  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase 初始化失败：", err);
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    userLikedKeys.clear();
    if (user && db) {
      await loadUserLikedKeys(collectLikeKeys());
      renderMihoyoFeed();
      renderFeed();
    } else {
      updateLikeCountsInDom();
    }
  });

  subscribePosts();
  subscribeLikes();
  subscribeViews();
}

function subscribePosts() {
  if (!db) return;

  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy("createdAt", "desc"));

  postsUnsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      dynamicPosts = snapshot.docs.map((docSnap) => mapFirestorePost(docSnap.id, docSnap.data()));
      if (currentUser) {
        await loadUserLikedKeys(collectLikeKeys());
      }
      renderFeed();
      updateLikeCountsInDom();
      updateViewCountsInDom();
    },
    (err) => {
      console.error("加载帖子失败：", err);
    }
  );
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
  if (currentUser) {
    openComposeModal();
  } else {
    openGuestModal();
  }
});

guestCancelBtn?.addEventListener("click", closeGuestModal);
guestModal?.addEventListener("click", (e) => {
  if (e.target === guestModal) closeGuestModal();
});

composeCloseBtn?.addEventListener("click", closeComposeModal);
composeCancelBtn?.addEventListener("click", closeComposeModal);
composeModal?.addEventListener("click", (e) => {
  if (e.target === composeModal) closeComposeModal();
});
composeForm?.addEventListener("submit", submitPost);

function openCafeLightbox(src, alt) {
  if (!cafeLightbox || !cafeLightboxImg || !src) return;
  cafeLightboxImg.src = src;
  cafeLightboxImg.alt = alt || "大图";
  cafeLightbox.classList.remove("hidden");
  cafeLightbox.hidden = false;
  updateBodyScrollLock();
}

function closeCafeLightbox() {
  if (!cafeLightbox) return;
  cafeLightbox.classList.add("hidden");
  cafeLightbox.hidden = true;
  if (cafeLightboxImg) cafeLightboxImg.src = "";
  updateBodyScrollLock();
}

mihoyoFeedEl?.addEventListener("click", (e) => {
  const replyToggle = e.target.closest(".cafe-reply-toggle");
  if (replyToggle) {
    e.preventDefault();
    toggleReplyPanel(replyToggle);
    return;
  }
  const likeBtn = e.target.closest(".cafe-like-btn");
  if (likeBtn && !likeBtn.disabled) {
    e.preventDefault();
    likePost(likeBtn.dataset.likeKey);
    return;
  }
  const img = e.target.closest(".cafe-post-images img, .cafe-reply-images img");
  if (!img) return;
  e.preventDefault();
  e.stopPropagation();
  openCafeLightbox(img.currentSrc || img.src, img.alt);
});

feedEl?.addEventListener("click", (e) => {
  const likeBtn = e.target.closest(".cafe-like-btn");
  if (likeBtn && !likeBtn.disabled) {
    e.preventDefault();
    likePost(likeBtn.dataset.likeKey);
    return;
  }
  const img = e.target.closest(".cafe-post-images img");
  if (!img) return;
  e.preventDefault();
  e.stopPropagation();
  openCafeLightbox(img.currentSrc || img.src, img.alt);
});

cafeLightboxClose?.addEventListener("click", (e) => {
  e.stopPropagation();
  closeCafeLightbox();
});

cafeLightbox?.addEventListener("click", (e) => {
  if (e.target === cafeLightbox) closeCafeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (cafeLightbox && !cafeLightbox.classList.contains("hidden")) {
    closeCafeLightbox();
    return;
  }
  if (composeModal && !composeModal.classList.contains("hidden")) {
    closeComposeModal();
    return;
  }
  if (guestModal && !guestModal.classList.contains("hidden")) {
    closeGuestModal();
  }
});

initFirebase();
loadMihoyoFeed();
scheduleMihoyoRefresh();
renderFeed();

mihoyoRefreshBtn?.addEventListener("click", () => loadMihoyoFeed());

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) loadMihoyoFeed({ silent: true });
});

window.addEventListener("beforeunload", () => {
  postsUnsubscribe?.();
  likesUnsubscribe?.();
  viewsUnsubscribe?.();
});
