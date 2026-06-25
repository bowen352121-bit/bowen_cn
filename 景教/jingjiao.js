/**
 * 景教留言板 · Firebase v10 + Surmon 风格编辑器
 */
import { firebaseConfig, isFirebaseReady, guestbookAdmin } from "./firebase-config.js";
import { loadFirebaseSdk } from "./firebase-sdk.js";

const FIRESTORE_COLLECTION = "guestbook_comments";
const PAGE_SIZE = 15;
const DEFAULT_AVATAR = "../images/nuomu1压缩2.gif";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😘", "😎", "🤔",
  "👍", "👎", "👏", "🙏", "💪", "❤️", "🔥", "✨", "🎉", "💯",
  "😭", "😅", "🤗", "😴", "🥺", "😤", "🫡", "⚡", "🌟", "💡",
];

let app = null;
let auth = null;
let db = null;
let currentUser = null;

let initializeApp;
let getApps;
let getAuth;
let initializeAuth;
let indexedDBLocalPersistence;
let browserLocalPersistence;
let browserPopupRedirectResolver;
let GoogleAuthProvider;
let GithubAuthProvider;
let signInWithPopup;
let signInWithRedirect;
let getRedirectResult;
let onAuthStateChanged;
let signOut;
let getFirestore;
let collection;
let addDoc;
let doc;
let writeBatch;
let query;
let orderBy;
let onSnapshot;
let serverTimestamp;

function bindFirebaseApi(sdk) {
  ({
    initializeApp,
    getApps,
    getAuth,
    initializeAuth,
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserPopupRedirectResolver,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    getFirestore,
    collection,
    addDoc,
    doc,
    writeBatch,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
  } = sdk);
}
let allComments = [];
let displayedCount = PAGE_SIZE;
let currentSort = "newest";
let replyTarget = null;
let previewMode = false;
let isSubmitting = false;
let unsubscribe = null;
const profileMetaByUid = {};
let authInitFailed = false;
let loginRedirectPending = false;

const els = {
  configBanner: document.getElementById("config-banner"),
  authPanel: document.getElementById("auth-panel"),
  loggedBar: document.getElementById("logged-bar"),
  composePanel: document.getElementById("compose-panel"),
  btnLoginGoogle: document.getElementById("btn-login-google"),
  btnLoginGithub: document.getElementById("btn-login-github"),
  btnLogout: document.getElementById("btn-logout"),
  userAvatar: document.getElementById("user-avatar"),
  userAvatarMini: document.getElementById("user-avatar-mini"),
  userNameMini: document.getElementById("user-name-mini"),
  commentInput: document.getElementById("comment-input"),
  commentPreview: document.getElementById("comment-preview"),
  btnSubmit: document.getElementById("btn-submit"),
  btnToolImage: document.getElementById("btn-tool-image"),
  btnToolEmoji: document.getElementById("btn-tool-emoji"),
  btnToolLink: document.getElementById("btn-tool-link"),
  btnToolCode: document.getElementById("btn-tool-code"),
  btnToolPreview: document.getElementById("btn-tool-preview"),
  emojiPanel: document.getElementById("emoji-panel"),
  replyIndicator: document.getElementById("reply-indicator"),
  replyTargetName: document.getElementById("reply-target-name"),
  btnCancelReply: document.getElementById("btn-cancel-reply"),
  commentsList: document.getElementById("comments-list"),
  commentTotal: document.getElementById("comment-total"),
  sidebarCommentCount: document.getElementById("sidebar-comment-count"),
  btnLoadMore: document.getElementById("btn-load-more"),
  commentsEmpty: document.getElementById("comments-empty"),
  sortSelect: document.getElementById("sort-select"),
  imageLightbox: document.getElementById("image-lightbox"),
  imageLightboxImg: document.querySelector("#image-lightbox .img-lightbox-img"),
};

function createAuth(appInstance) {
  try {
    return initializeAuth(appInstance, {
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (err) {
    if (err?.code === "auth/already-initialized") {
      return getAuth(appInstance);
    }
    return initializeAuth(appInstance, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
}

async function initFirebase() {
  if (!isFirebaseReady()) {
    showConfigBanner();
    authInitFailed = true;
    return false;
  }

  const sdk = await loadFirebaseSdk();
  if (!sdk) {
    els.configBanner.classList.remove("hidden");
    els.configBanner.textContent =
      "Firebase 服务暂不可用（国内网络可能无法加载）。页面可浏览，登录与留言需特殊网络。";
    els.commentsList.innerHTML =
      '<p class="comments-error">留言功能需加载 Firebase，当前网络无法连接。请稍后再试或使用特殊网络。</p>';
    authInitFailed = true;
    return false;
  }
  bindFirebaseApi(sdk);

  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = createAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase 初始化失败：", err);
    els.configBanner.classList.remove("hidden");
    els.configBanner.textContent =
      "Firebase 初始化失败，请强制刷新页面（Ctrl+F5）后重试：" + (err.message || "未知错误");
    authInitFailed = true;
    return false;
  }

  els.configBanner.classList.add("hidden");

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) getProfileMetaForUser(user);
    updateAuthUI();

    if (user) {
      subscribeComments();
    } else {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      allComments = [];
      els.commentsList.innerHTML =
        '<p class="comments-error">请先 Google 或 GitHub 登录后查看与发表留言。</p>';
      els.commentTotal.textContent = "0";
      els.sidebarCommentCount.textContent = "0";
      els.commentsEmpty?.classList.add("hidden");
      els.btnLoadMore.classList.add("hidden");
    }
  });

  void consumeRedirectResult();

  return true;
}

function consumeRedirectResult() {
  if (!auth || !getRedirectResult) return;

  const timeoutMs = 10000;
  Promise.race([
    getRedirectResult(auth),
    new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ])
    .then((result) => {
      if (result?.user) cacheProfileMeta(result);
    })
    .catch((err) => {
      if (err.code === "auth/popup-closed-by-user") return;
      console.error("登录回调失败：", err);
      els.configBanner.classList.remove("hidden");
      els.configBanner.textContent =
        "登录失败：" + (err.message || err.code || "未知错误");
    });
}

function showConfigBanner() {
  els.configBanner.classList.remove("hidden");
  els.configBanner.textContent =
    "请先在 景教/firebase-config.js 中填入 Firebase Config，保存后刷新本页。";
}

function getAuthProvider(name) {
  if (name === "github") {
    const provider = new GithubAuthProvider();
    provider.addScope("read:user");
    return provider;
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

function prefersRedirectLogin() {
  const coarseTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1024px)").matches;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return coarseTouch || narrow || mobileUa;
}

function showLoginError(label, err) {
  let hint = "";
  if (err?.code === "auth/unauthorized-domain") {
    hint =
      "\n\n请在 Firebase 控制台 → Authentication → Settings → Authorized domains 中添加当前站点域名。";
  } else if (err?.code === "auth/operation-not-allowed") {
    hint =
      "\n\n请在 Firebase 控制台 → Authentication → Sign-in method 中启用 " + label + " 登录。";
  }
  alert(`${label} 登录失败（${err?.code || "error"}）：${err?.message || "请稍后重试"}${hint}`);
}

function setLoginButtonsState(state) {
  const busy = state === "busy";
  const ready = state === "ready";
  const failed = state === "idle";
  [els.btnLoginGoogle, els.btnLoginGithub].forEach((btn) => {
    if (!btn) return;
    btn.disabled = busy || failed;
    btn.classList.toggle("is-busy", busy);
    btn.classList.toggle("is-ready", ready);
    btn.classList.toggle("is-disabled", failed);
  });
  const tip = els.authPanel?.querySelector(".gb-auth-tip");
  if (tip) {
    if (busy) tip.textContent = "正在连接登录服务…";
    else if (loginRedirectPending) tip.textContent = "正在跳转，请稍候…";
    else if (authInitFailed) tip.textContent = "登录服务暂不可用，请检查网络后刷新";
    else if (!auth) tip.textContent = "正在准备登录…";
    else tip.textContent = "使用 Google 或 GitHub 登录后即可留言";
  }
}

function loginWithProvider(name) {
  if (!auth) {
    if (authInitFailed) {
      alert("Firebase 尚未就绪。请查看页面顶部黄色提示，或检查网络后刷新页面。");
      return;
    }
    alert("登录服务仍在加载，请稍等 1～2 秒后再点一次。");
    return;
  }

  const label = name === "github" ? "GitHub" : "Google";
  const provider = getAuthProvider(name);

  if (prefersRedirectLogin()) {
    loginRedirectPending = true;
    setLoginButtonsState("busy");
    signInWithRedirect(auth, provider).catch((err) => {
      loginRedirectPending = false;
      setLoginButtonsState("ready");
      console.error(`${label} 跳转登录失败：`, err);
      showLoginError(label, err);
    });
    return;
  }

  void loginWithPopup(name, label, provider);
}

async function loginWithPopup(name, label, provider) {
  try {
    const result = await signInWithPopup(auth, provider);
    cacheProfileMeta(result);
  } catch (err) {
    console.error(`${label} 登录失败：`, err);
    if (err.code === "auth/popup-closed-by-user") return;

    if (err.code === "auth/popup-blocked") {
      signInWithRedirect(auth, getAuthProvider(name)).catch((redirectErr) => {
        console.error("跳转登录失败：", redirectErr);
        showLoginError(label, redirectErr);
      });
      return;
    }

    showLoginError(label, err);
  }
}

function getProviderLabel(user) {
  const id = user?.providerData?.[0]?.providerId || "";
  if (id.includes("github")) return "GitHub";
  if (id.includes("google")) return "Google";
  return "访客";
}

async function logout() {
  if (!auth) return;
  await signOut(auth);
  clearReply();
  setPreviewMode(false);
}

function getAuthEmail(user) {
  if (!user) return "";
  if (user.email) return user.email.toLowerCase();
  for (const p of user.providerData || []) {
    if (p.email) return p.email.toLowerCase();
  }
  return "";
}

function normalizeProfileUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isUglyProfileUrl(url) {
  if (!url) return true;
  if (url.includes("profiles.google.com")) return true;
  try {
    const path = new URL(url).pathname;
    if (/\/\d{12,}/.test(path)) return true;
  } catch {
    return true;
  }
  return false;
}

function extractProfileMetaFromSignIn(result) {
  const empty = { url: "", label: "" };
  const user = result?.user;
  const info = result?.additionalUserInfo;
  const profile = info?.profile;
  if (!user || !profile) return empty;

  const providerId = info?.providerId || user.providerData?.[0]?.providerId || "";

  if (providerId.includes("github")) {
    const login = String(profile.login || "").trim();
    if (!login) return empty;
    return {
      url: profile.html_url || `https://github.com/${login}`,
      label: `github.com/${login}`,
    };
  }

  if (providerId.includes("google")) {
    const link = normalizeProfileUrl(profile.link || profile.url);
    if (link && !isUglyProfileUrl(link)) {
      return { url: link, label: formatProfileLabel(link) };
    }
    return empty;
  }

  return empty;
}

function cacheProfileMeta(signInResult) {
  if (!signInResult?.user) return;
  const meta = extractProfileMetaFromSignIn(signInResult);
  if (!meta.url || !meta.label) return;
  profileMetaByUid[signInResult.user.uid] = meta;
  try {
    localStorage.setItem(`gb_profile_${signInResult.user.uid}`, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

function inferProfileMetaFromUser(user) {
  for (const p of user.providerData || []) {
    if (p.providerId === "github.com") {
      const login = p.displayName?.trim();
      if (login && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(login)) {
        return {
          url: `https://github.com/${login}`,
          label: `github.com/${login}`,
        };
      }
    }
  }
  return { url: "", label: "" };
}

function readCachedProfileMeta(uid) {
  try {
    const raw = localStorage.getItem(`gb_profile_${uid}`);
    if (!raw) return null;
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw);
      if (parsed?.url && parsed?.label && !isUglyProfileUrl(parsed.url)) return parsed;
      return null;
    }
    if (isUglyProfileUrl(raw)) return null;
    return { url: raw, label: formatProfileLabel(raw) };
  } catch {
    return null;
  }
}

function getProfileMetaForUser(user) {
  if (!user) return { url: "", label: "" };
  if (profileMetaByUid[user.uid]?.url) return profileMetaByUid[user.uid];
  const cached = readCachedProfileMeta(user.uid);
  if (cached) {
    profileMetaByUid[user.uid] = cached;
    return cached;
  }
  const inferred = inferProfileMetaFromUser(user);
  if (inferred.url) profileMetaByUid[user.uid] = inferred;
  return inferred;
}

function getCommentProfileMeta(comment) {
  let url = comment.profileUrl || comment.website || "";
  let label = comment.profileLabel || "";

  if (url && isUglyProfileUrl(url)) {
    url = "";
    label = "";
  }

  if (url && !label) label = formatProfileLabel(url);
  if (label && /\d{12,}/.test(label)) {
    url = "";
    label = "";
  }

  return { url, label };
}

function formatProfileLabel(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "github.com" && u.pathname.length > 1) {
      return host + u.pathname.replace(/\/$/, "");
    }
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return host + path;
  } catch {
    return url;
  }
}

function buildAuthorProfileHtml(comment) {
  const { url, label } = getCommentProfileMeta(comment);
  if (!url || !label) return "";
  return `<a class="comment-loc" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

/** 常见国家/地区中文名（IP 接口返回英文时转换） */
const COUNTRY_ZH = {
  CN: "中国", HK: "香港", MO: "澳门", TW: "台湾",
  JP: "日本", SG: "新加坡", US: "美国", GB: "英国", UK: "英国",
  KR: "韩国", DE: "德国", FR: "法国", CA: "加拿大", AU: "澳大利亚",
  RU: "俄罗斯", IN: "印度", TH: "泰国", MY: "马来西亚", VN: "越南",
  PH: "菲律宾", ID: "印度尼西亚", NL: "荷兰", SE: "瑞典", CH: "瑞士",
  IT: "意大利", ES: "西班牙", BR: "巴西", MX: "墨西哥", NZ: "新西兰",
};

function localizeCountryName(code, englishName) {
  const key = String(code || "").toUpperCase();
  if (COUNTRY_ZH[key]) return COUNTRY_ZH[key];
  return englishName || key;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("Firefox/")) return "firefox";
  if (ua.includes("Chrome/")) return "chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "safari";
  return "other";
}

function buildBrowserIconHtml(browser) {
  const icons = {
    chrome: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#4285F4"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>',
    edge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0078D7" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17V7h2v7.17l3.59-3.59L16 13l-5 5z"/></svg>',
    firefox: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#FF7139"/></svg>',
    safari: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#0fb5ee"/></svg>',
    other: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#bbb"/></svg>',
  };
  const key = browser && icons[browser] ? browser : "other";
  return `<span class="comment-browser comment-browser--${key}" title="浏览器">${icons[key]}</span>`;
}

function buildLocationHtml(comment) {
  const code = comment.geoCountryCode;
  const country = comment.geoCountry;
  const city = comment.geoCity;
  if (code) {
    const label = city
      ? `${code} ${country} · ${city}`
      : `${code} ${country}`;
    return `<span class="comment-geo">${escapeHtml(label)}</span>`;
  }
  if (comment.location) {
    return `<span class="comment-geo">${escapeHtml(comment.location)}</span>`;
  }
  return "";
}

async function fetchVisitorGeo() {
  const parsers = [
    {
      url: "https://ipwho.is/",
      parse: (d) => {
        if (!d?.success) throw new Error("geo fail");
        return {
          countryCode: d.country_code || "",
          countryName: d.country || "",
          city: d.city || "",
        };
      },
    },
    {
      url: "https://ipapi.co/json/",
      parse: (d) => ({
        countryCode: d.country_code || "",
        countryName: d.country_name || "",
        city: d.city || "",
      }),
    },
  ];

  for (const { url, parse } of parsers) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!res.ok) continue;
      const data = await res.json();
      const geo = parse(data);
      if (!geo.countryCode) continue;
      return {
        geoCountryCode: geo.countryCode.toUpperCase(),
        geoCountry: localizeCountryName(geo.countryCode, geo.countryName),
        geoCity: geo.city || "",
      };
    } catch {
      /* try next */
    }
  }
  return { geoCountryCode: "", geoCountry: "", geoCity: "" };
}

function isAdmin() {
  if (!currentUser) return false;
  if (guestbookAdmin.uids?.includes(currentUser.uid)) return true;
  const email = getAuthEmail(currentUser);
  return guestbookAdmin.emails?.some((e) => e.toLowerCase() === email);
}

function getDisplayName(user) {
  if (!user) return "用户";
  if (user.displayName?.trim()) return user.displayName.trim();

  const provider = user.providerData?.[0];
  if (provider?.displayName?.trim()) return provider.displayName.trim();

  if (user.email?.includes("@")) return user.email.split("@")[0];

  return getProviderLabel(user) + " 用户";
}

function syncUserDisplay() {
  if (!currentUser) return;
  const name = getDisplayName(currentUser);
  els.userAvatar.src = DEFAULT_AVATAR;
  els.userAvatarMini.src = DEFAULT_AVATAR;
  els.userNameMini.textContent = name;
}

function updateAuthUI() {
  if (currentUser) {
    els.authPanel.classList.add("hidden");
    els.loggedBar.classList.remove("hidden");
    els.composePanel.classList.remove("hidden");
    syncUserDisplay();
  } else {
    els.authPanel.classList.remove("hidden");
    els.loggedBar.classList.add("hidden");
    els.composePanel.classList.add("hidden");
    setLoginButtonsState(auth ? "ready" : authInitFailed ? "idle" : "busy");
  }
  updateSubmitState();
  if (allComments.length) renderComments();
}

function hasCommentContent() {
  return getEditorMarkdown().trim().length > 0;
}

function getEditorMarkdown() {
  const el = els.commentInput;
  let md = "";

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      md += node.textContent;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName;
    if (tag === "BR") {
      md += "\n";
      return;
    }
    if (tag === "IMG") {
      const alt = node.alt || "图片";
      const src = node.getAttribute("src") || "";
      if (src) md += `![${alt}](${src})`;
      return;
    }
    if (tag === "PRE") {
      const code = node.querySelector("code");
      md += "\n```\n" + (code?.textContent || node.textContent).trim() + "\n```\n";
      return;
    }
    if (tag === "DIV" && node !== el) {
      node.childNodes.forEach(walk);
      if (node.nextSibling) md += "\n";
      return;
    }
    node.childNodes.forEach(walk);
  }

  el.childNodes.forEach(walk);
  return md;
}

function clearEditor() {
  els.commentInput.replaceChildren();
  updateSubmitState();
}

function setEditorMarkdown(md) {
  mountRichContent(els.commentInput, md);
  updateSubmitState();
}

function focusEditor() {
  els.commentInput.focus();
}

function insertNodesAtCursor(nodes) {
  const el = els.commentInput;
  el.focus();
  const sel = window.getSelection();
  let range;

  if (sel.rangeCount && el.contains(sel.anchorNode)) {
    range = sel.getRangeAt(0);
    range.deleteContents();
  } else {
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
  }

  const frag = document.createDocumentFragment();
  nodes.forEach((node) => frag.appendChild(node));
  const last = nodes[nodes.length - 1];
  range.insertNode(frag);
  range.setStartAfter(last);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function insertAtCursor(text) {
  insertNodesAtCursor([document.createTextNode(text)]);
  updateSubmitState();
  if (previewMode) updatePreview();
}

function insertImageAtCursor(url, alt = "图片") {
  const img = document.createElement("img");
  img.className = "comment-inline-img";
  img.alt = alt;
  img.src = url;
  img.contentEditable = "false";
  insertNodesAtCursor([img, document.createElement("br")]);
  updateSubmitState();
  if (previewMode) updatePreview();
}

function updateSubmitState() {
  els.btnSubmit.disabled = !currentUser || !hasCommentContent() || isSubmitting;
}

function subscribeComments() {
  if (!db) return;
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      allComments = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          parentId: data.parentId || null,
          uid: data.uid || "",
          author: data.author || "访客",
          profileUrl: data.profileUrl || data.website || "",
          profileLabel: data.profileLabel || "",
          geoCountryCode: data.geoCountryCode || "",
          geoCountry: data.geoCountry || "",
          geoCity: data.geoCity || "",
          location: data.location || "",
          browser: data.browser || "",
          avatar: data.avatar || DEFAULT_AVATAR,
          content: data.content || "",
          replyTo: data.replyTo || "",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
      renderComments();
    },
    (err) => {
      console.error("留言加载失败：", err);
      els.commentsList.innerHTML =
        `<p class="comments-error">留言加载失败：${escapeHtml(err.message)}</p>`;
    }
  );
}

function insertImageByUrl() {
  const url = prompt("图片地址（URL 或本站路径，如 ../jj_images/xxx.jpg）：", "https://");
  if (!url || !url.trim()) return;

  const trimmed = url.trim();
  const alt = prompt("图片描述（可选）：", "图片") || "图片";
  insertImageAtCursor(trimmed, alt);
}

function compressImageFile(file, maxWidth = 720, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 480000 && quality > 0.35) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("图片读取失败"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

async function handlePasteImage(e) {
  const items = e.clipboardData?.items;
  if (!items) return false;

  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;

    e.preventDefault();
    const file = item.getAsFile();
    if (!file) return true;

    try {
      const dataUrl = await compressImageFile(file);
      if (dataUrl.length > 500000) {
        alert("粘贴的图片太大，请改用图片链接，或将图片放到 jj_images 文件夹后填入路径。");
        return true;
      }
      insertImageAtCursor(dataUrl, "粘贴图片");
    } catch (err) {
      alert("粘贴图片失败：" + (err.message || "未知错误"));
    }
    return true;
  }

  return false;
}

async function handleEditorPaste(e) {
  if (await handlePasteImage(e)) return;

  const text = e.clipboardData?.getData("text/plain") || "";
  if (!text.includes("![") || !text.includes("](")) return;

  const parts = parseMarkdownImages(text);
  const hasImage = parts.some((p) => p.type === "image");
  if (!hasImage) return;

  e.preventDefault();
  parts.forEach((part) => {
    if (part.type === "image") insertImageAtCursor(part.url, part.alt);
    else if (part.value) insertAtCursor(part.value);
  });
}

async function submitComment() {
  if (isSubmitting || !db || !currentUser) return;

  const text = getEditorMarkdown();
  if (!text.trim()) return;
  if (text.length > 500000) {
    alert("内容超过 500000 字符限制，请缩短文字或改用图片链接。");
    return;
  }

  isSubmitting = true;
  els.btnSubmit.disabled = true;
  els.btnSubmit.textContent = "发布中…";

  try {
    let content = text;
    let parentId = null;
    let replyTo = "";

    if (replyTarget) {
      const refLabel = `#${replyTarget.id.slice(0, 6)}`;
      content = `回复${refLabel}${replyTarget.author}：\n${text}`;
      parentId = replyTarget.id;
      replyTo = replyTarget.author;
    }

    const profileMeta = getProfileMetaForUser(currentUser);
    const geo = await fetchVisitorGeo();

    await addDoc(collection(db, FIRESTORE_COLLECTION), {
      uid: currentUser.uid,
      author: getDisplayName(currentUser),
      profileUrl: profileMeta.url,
      profileLabel: profileMeta.label,
      geoCountryCode: geo.geoCountryCode,
      geoCountry: geo.geoCountry,
      geoCity: geo.geoCity,
      browser: detectBrowser(),
      avatar: DEFAULT_AVATAR,
      provider: currentUser.providerData?.[0]?.providerId || "",
      content,
      parentId,
      replyTo,
      createdAt: serverTimestamp(),
    });

    clearEditor();
    clearReply();
    setPreviewMode(false);
  } catch (err) {
    console.error("发表失败：", err);
    const msg = err.code === "permission-denied"
      ? "发表被拒绝：请检查 Firestore 安全规则是否允许写入，以及内容大小限制。"
      : (err.message || "未知错误");
    alert("发表失败：" + msg);
  } finally {
    isSubmitting = false;
    els.btnSubmit.textContent = "发布";
    updateSubmitState();
  }
}

// ── 编辑器工具 ──────────────────────────────────────────
function wrapSelection(before, after = before) {
  const el = els.commentInput;
  const sel = window.getSelection();
  if (!sel.rangeCount || !el.contains(sel.anchorNode)) {
    insertAtCursor(before + "代码" + after);
    return;
  }
  const range = sel.getRangeAt(0);
  const selected = range.toString() || "代码";
  const textNode = document.createTextNode(before + selected + after);
  range.deleteContents();
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  updateSubmitState();
  if (previewMode) updatePreview();
}

function insertLink() {
  const url = prompt("请输入链接地址：", "https://");
  if (!url) return;
  const sel = window.getSelection();
  const selected = sel.rangeCount ? sel.toString() : "";
  insertAtCursor(`[${selected || "链接文字"}](${url.trim()})`);
}

function insertCode() {
  const sel = window.getSelection();
  const selected = sel.rangeCount ? sel.toString() : "";
  if (selected) {
    wrapSelection("`", "`");
  } else {
    insertAtCursor("\n```\n代码\n```\n");
  }
}

function buildEmojiPanel() {
  if (!els.emojiPanel) return;
  els.emojiPanel.replaceChildren();
  EMOJIS.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = emoji;
    btn.setAttribute("aria-label", emoji);
    btn.addEventListener("click", () => {
      insertAtCursor(emoji);
      els.emojiPanel.classList.add("hidden");
    });
    els.emojiPanel.appendChild(btn);
  });
}

function toggleEmojiPanel() {
  els.emojiPanel.classList.toggle("hidden");
}

function setPreviewMode(on) {
  previewMode = on;
  els.btnToolPreview.classList.toggle("is-active", on);
  els.commentPreview.classList.toggle("hidden", !on);
  if (on) {
    els.commentInput.classList.add("hidden");
    updatePreview();
  } else {
    els.commentInput.classList.remove("hidden");
  }
}

function togglePreview() {
  setPreviewMode(!previewMode);
}

function updatePreview() {
  mountRichContent(els.commentPreview, getEditorMarkdown());
}

// ── 富文本渲染（DOM 挂载，支持超长 Base64）────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isBase64Char(c) {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || (c >= "0" && c <= "9") || c === "+" || c === "/" || c === "=";
}

/** 从 data:image 起扫描 Base64 结束位置 */
function findDataUrlEnd(text, start) {
  const marker = ";base64,";
  const markerIdx = text.indexOf(marker, start);
  if (markerIdx === -1) return -1;
  let j = markerIdx + marker.length;
  while (j < text.length && isBase64Char(text[j])) j += 1;
  return j;
}

function parseMarkdownImages(text) {
  const parts = [];
  let i = 0;

  while (i < text.length) {
    const start = text.indexOf("![", i);
    if (start === -1) {
      parts.push({ type: "text", value: text.slice(i) });
      break;
    }

    if (start > i) parts.push({ type: "text", value: text.slice(i, start) });

    const altClose = text.indexOf("](", start + 2);
    if (altClose === -1) {
      parts.push({ type: "text", value: text.slice(start) });
      break;
    }

    const alt = text.slice(start + 2, altClose);
    const urlStart = altClose + 2;

    if (text.startsWith("data:", urlStart)) {
      const end = findDataUrlEnd(text, urlStart);
      if (end > urlStart) {
        parts.push({ type: "image", alt, url: text.slice(urlStart, end) });
        i = end;
        if (text[i] === ")") i += 1;
        continue;
      }
    }

    const urlEnd = text.indexOf(")", urlStart);
    if (urlEnd === -1) {
      parts.push({ type: "text", value: text.slice(start) });
      break;
    }

    parts.push({ type: "image", alt, url: text.slice(urlStart, urlEnd) });
    i = urlEnd + 1;
  }

  return parts;
}

function parseStandaloneDataImages(text) {
  const parts = [];
  let i = 0;

  while (i < text.length) {
    const idx = text.indexOf("data:image/", i);
    if (idx === -1) {
      parts.push({ type: "text", value: text.slice(i) });
      break;
    }

    if (idx > i) parts.push({ type: "text", value: text.slice(i, idx) });

    const end = findDataUrlEnd(text, idx);
    if (end <= idx) {
      parts.push({ type: "text", value: text.slice(idx, idx + 1) });
      i = idx + 1;
      continue;
    }

    parts.push({ type: "image", alt: "图片", url: text.slice(idx, end) });
    i = end;
  }

  return parts;
}

function appendTextWithBreaks(container, text) {
  if (!text) return;
  const lines = text.split("\n");
  lines.forEach((line, idx) => {
    if (line) container.appendChild(document.createTextNode(line));
    if (idx < lines.length - 1) container.appendChild(document.createElement("br"));
  });
}

function appendFormattedText(container, text) {
  if (!text) return;

  const parts = parseStandaloneDataImages(text);
  parts.forEach((part) => {
    if (part.type === "image") {
      const img = document.createElement("img");
      img.className = "comment-inline-img";
      img.alt = part.alt || "图片";
      img.loading = "lazy";
      img.src = part.url;
      container.appendChild(img);
    } else {
      appendTextWithBreaks(container, part.value);
    }
  });
}

function mountImage(container, url, alt) {
  const img = document.createElement("img");
  img.className = "comment-inline-img";
  img.alt = alt || "图片";
  img.loading = "lazy";
  img.src = url;
  img.onerror = () => img.classList.add("is-broken");
  container.appendChild(img);
}

function openImageLightbox(src, alt) {
  if (!els.imageLightbox || !els.imageLightboxImg || !src) return;
  els.imageLightboxImg.src = src;
  els.imageLightboxImg.alt = alt || "大图";
  els.imageLightbox.classList.remove("hidden");
  els.imageLightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeImageLightbox() {
  if (!els.imageLightbox) return;
  els.imageLightbox.classList.add("hidden");
  els.imageLightbox.hidden = true;
  if (els.imageLightboxImg) els.imageLightboxImg.src = "";
  document.body.style.overflow = "";
}

function bindLightboxEvents() {
  const closeBtn = els.imageLightbox?.querySelector(".img-lightbox-close");
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeImageLightbox();
  });

  els.imageLightbox?.addEventListener("click", (e) => {
    if (e.target === els.imageLightbox) closeImageLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.imageLightbox && !els.imageLightbox.classList.contains("hidden")) {
      closeImageLightbox();
    }
  });
}

function mountRichContent(container, raw) {
  container.replaceChildren();
  if (!raw) return;

  let i = 0;
  while (i < raw.length) {
    const codeStart = raw.indexOf("```", i);
    if (codeStart === -1) {
      mountInlineSegments(container, raw.slice(i));
      break;
    }

    if (codeStart > i) mountInlineSegments(container, raw.slice(i, codeStart));

    const codeEnd = raw.indexOf("```", codeStart + 3);
    if (codeEnd === -1) {
      mountInlineSegments(container, raw.slice(codeStart));
      break;
    }

    const pre = document.createElement("pre");
    pre.className = "comment-code";
    const code = document.createElement("code");
    code.textContent = raw.slice(codeStart + 3, codeEnd).trim();
    pre.appendChild(code);
    container.appendChild(pre);
    i = codeEnd + 3;
  }
}

function mountInlineSegments(container, text) {
  if (!text) return;

  parseMarkdownImages(text).forEach((part) => {
    if (part.type === "image") {
      mountImage(container, part.url, part.alt);
    } else {
      appendFormattedText(container, part.value);
    }
  });
}

/** 兼容旧调用：返回 HTML 字符串（预览等） */
function renderRichContent(raw) {
  const wrap = document.createElement("div");
  mountRichContent(wrap, raw);
  return wrap.innerHTML;
}

// ── 评论列表渲染 ────────────────────────────────────────
function sortComments(roots) {
  const sorted = [...roots];
  if (currentSort === "newest") {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === "oldest") {
    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }
  return sorted;
}

function getRootComments() {
  return allComments.filter((c) => !c.parentId);
}

function getReplies(parentId) {
  return allComments
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function formatTime(iso) {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date) / 86400000);
  if (diffDays < 1) return "今天";
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderCommentItem(comment, isReply = false) {
  const el = document.createElement("article");
  el.className = "comment-item";

  const head = document.createElement("div");
  head.className = "comment-head";

  const avatar = document.createElement("img");
  avatar.className = "comment-avatar";
  avatar.src = comment.avatar;
  avatar.alt = "";
  avatar.loading = "lazy";
  avatar.onerror = () => { avatar.src = DEFAULT_AVATAR; };

  const meta = document.createElement("div");
  meta.className = "comment-meta";

  const authorRow = document.createElement("div");
  authorRow.className = "comment-author-row";
  authorRow.innerHTML = `
    <span class="comment-author">${escapeHtml(comment.author)}</span>
    ${buildAuthorProfileHtml(comment)}
    ${buildBrowserIconHtml(comment.browser)}
    ${buildLocationHtml(comment)}
  `;

  const body = document.createElement("div");
  body.className = "comment-body";
  mountRichContent(body, comment.content);

  const foot = document.createElement("div");
  foot.className = "comment-foot";
  const time = document.createElement("span");
  time.textContent = formatTime(comment.createdAt);
  foot.appendChild(time);

  if (!isReply) {
    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "btn-reply";
    replyBtn.dataset.id = comment.id;
    replyBtn.dataset.author = comment.author;
    replyBtn.textContent = "回复";
    foot.appendChild(replyBtn);
  }

  if (isAdmin()) {
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.dataset.id = comment.id;
    deleteBtn.dataset.isRoot = isReply ? "0" : "1";
    deleteBtn.textContent = "删除";
    foot.appendChild(deleteBtn);
  }

  meta.appendChild(authorRow);
  meta.appendChild(body);
  meta.appendChild(foot);
  head.appendChild(avatar);
  head.appendChild(meta);
  el.appendChild(head);

  if (!isReply) {
    const replies = getReplies(comment.id);
    if (replies.length) {
      const wrap = document.createElement("div");
      wrap.className = "comment-replies";
      replies.forEach((r) => wrap.appendChild(renderCommentItem(r, true)));
      el.appendChild(wrap);
    }
  }

  return el;
}

function renderComments() {
  const roots = sortComments(getRootComments());
  const total = allComments.length;

  els.commentTotal.textContent = total;
  els.sidebarCommentCount.textContent = total;
  els.commentsEmpty?.classList.toggle("hidden", total > 0);

  const slice = roots.slice(0, displayedCount);
  els.commentsList.replaceChildren();
  slice.forEach((c) => els.commentsList.appendChild(renderCommentItem(c)));
  els.btnLoadMore.classList.toggle("hidden", displayedCount >= roots.length);
}

function setReply(id, author) {
  replyTarget = { id, author };
  els.replyIndicator.classList.remove("hidden");
  els.replyTargetName.textContent = author;
  els.commentInput.focus();
}

function clearReply() {
  replyTarget = null;
  els.replyIndicator.classList.add("hidden");
}

async function deleteComment(commentId, isRoot) {
  if (!isAdmin() || !db) return;

  const replyCount = isRoot ? getReplies(commentId).length : 0;
  const msg =
    isRoot && replyCount > 0
      ? `确定删除这条留言及其 ${replyCount} 条回复？此操作不可撤销。`
      : "确定删除这条留言？此操作不可撤销。";
  if (!confirm(msg)) return;

  try {
    const ids = [commentId];
    if (isRoot) {
      allComments
        .filter((c) => c.parentId === commentId)
        .forEach((r) => ids.push(r.id));
    }

    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, FIRESTORE_COLLECTION, id)));
    await batch.commit();
  } catch (err) {
    console.error("删除失败：", err);
    const hint =
      err.code === "permission-denied"
        ? "删除被拒绝：请确认已用站长账号登录，且 Firestore 规则已部署。"
        : err.message || "未知错误";
    alert("删除失败：" + hint);
  }
}

function bindAuthEvents() {
  const bindLogin = (btn, name) => {
    if (!btn) return;
    btn.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        loginWithProvider(name);
      },
      { passive: false }
    );
  };
  bindLogin(els.btnLoginGoogle, "google");
  bindLogin(els.btnLoginGithub, "github");
  els.btnLogout?.addEventListener("click", () => void logout());
}

function bindEditorEvents() {
  if (!els.commentInput) return;

  els.btnCancelReply?.addEventListener("click", clearReply);

  els.commentInput.addEventListener("input", () => {
    updateSubmitState();
    if (previewMode) updatePreview();
  });

  els.commentInput.addEventListener("paste", handleEditorPaste);

  els.btnSubmit?.addEventListener("click", submitComment);

  els.commentInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  });

  els.btnToolImage?.addEventListener("click", insertImageByUrl);
  els.btnToolEmoji?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmojiPanel();
  });
  els.btnToolLink?.addEventListener("click", insertLink);
  els.btnToolCode?.addEventListener("click", insertCode);
  els.btnToolPreview?.addEventListener("click", togglePreview);

  els.sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    displayedCount = PAGE_SIZE;
    renderComments();
  });

  els.btnLoadMore?.addEventListener("click", () => {
    displayedCount += PAGE_SIZE;
    renderComments();
  });

  els.commentsList?.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".btn-delete");
    if (delBtn) {
      e.preventDefault();
      deleteComment(delBtn.dataset.id, delBtn.dataset.isRoot === "1");
      return;
    }

    const zoomImg = e.target.closest(".comment-body .comment-inline-img");
    if (zoomImg && !zoomImg.classList.contains("is-broken")) {
      e.preventDefault();
      openImageLightbox(zoomImg.src, zoomImg.alt);
      return;
    }

    const btn = e.target.closest(".btn-reply");
    if (!btn) return;
    if (!currentUser) {
      alert("请先 Google 或 GitHub 登录后再回复。");
      return;
    }
    setReply(btn.dataset.id, btn.dataset.author);
  });

  document.addEventListener("click", (e) => {
    if (!els.emojiPanel?.contains(e.target) && e.target !== els.btnToolEmoji) {
      els.emojiPanel?.classList.add("hidden");
    }
  });
}

async function boot() {
  bindAuthEvents();
  bindLightboxEvents();
  setLoginButtonsState("busy");

  const ok = await initFirebase();
  loginRedirectPending = false;
  setLoginButtonsState(ok && auth ? "ready" : authInitFailed ? "idle" : "busy");

  try {
    buildEmojiPanel();
    bindEditorEvents();
  } catch (err) {
    console.error("编辑器初始化失败（登录仍可用）：", err);
  }
  updateAuthUI();
}

void boot();
