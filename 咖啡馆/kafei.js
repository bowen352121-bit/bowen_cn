/**
 * 咖啡馆 · 米游社风格帖子流 + Firebase 发帖
 */
import { firebaseConfig, isFirebaseReady } from "../景教/firebase-config.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const PAGE_SIZE = 8;
const FIRESTORE_COLLECTION = "cafe_posts";
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
let currentUser = null;
let dynamicPosts = [];
let postsUnsubscribe = null;
let isSubmitting = false;

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
    <div class="cafe-post-foot">
      <span class="cafe-stat" title="评论">💬 ${post.comments}</span>
      <span class="cafe-stat" title="浏览">👁 ${post.views}</span>
      <span class="cafe-stat" title="点赞">♥ ${post.likes}</span>
    </div>
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

  article.innerHTML = `
    <div class="cafe-post-head">
      ${renderAvatarHtml(post.author, post.avatar_local)}
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
    <div class="cafe-post-foot cafe-mihoyo-foot">
      <span class="cafe-stat" title="评论">💬 ${post.replies ?? 0}</span>
      <span class="cafe-stat" title="浏览">👁 ${post.views ?? 0}</span>
      <span class="cafe-stat" title="点赞">♥ ${post.likes ?? 0}</span>
      <a class="cafe-mihoyo-link" href="${escapeHtml(post.post_url || "#")}" target="_blank" rel="noopener noreferrer">查看原帖 ›</a>
    </div>
  `;

  return article;
}

async function loadMihoyoFeed() {
  if (!mihoyoFeedEl) return;

  try {
    const resp = await fetch(`mihoyo_data.json?_=${Date.now()}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    if (!posts.length) {
      mihoyoFeedEl.replaceChildren();
      mihoyoEmptyEl?.classList.remove("hidden");
      return;
    }

    mihoyoEmptyEl?.classList.add("hidden");
    mihoyoFeedEl.replaceChildren();
    posts.forEach((post) => mihoyoFeedEl.appendChild(renderMihoyoPost(post)));
  } catch (err) {
    console.warn("米游社数据加载失败：", err);
    mihoyoFeedEl.replaceChildren();
    mihoyoEmptyEl?.classList.remove("hidden");
  }
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

function initFirebase() {
  if (!isFirebaseReady()) {
    console.warn("Firebase 未配置，咖啡馆仅展示静态帖子。");
    return;
  }

  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase 初始化失败：", err);
    return;
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
  });

  subscribePosts();
}

function subscribePosts() {
  if (!db) return;

  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy("createdAt", "desc"));

  postsUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      dynamicPosts = snapshot.docs.map((docSnap) => mapFirestorePost(docSnap.id, docSnap.data()));
      renderFeed();
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

feedEl?.addEventListener("click", (e) => {
  const img = e.target.closest(".cafe-post-images img");
  if (!img) return;
  e.preventDefault();
  e.stopPropagation();
  openCafeLightbox(img.currentSrc || img.src, img.alt);
});

mihoyoFeedEl?.addEventListener("click", (e) => {
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
renderFeed();

window.addEventListener("beforeunload", () => {
  postsUnsubscribe?.();
});
