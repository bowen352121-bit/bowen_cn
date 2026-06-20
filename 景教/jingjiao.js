/**
 * 景教留言板 · Firebase v10 + Surmon 风格编辑器
 */
import { firebaseConfig, isFirebaseReady } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const FIRESTORE_COLLECTION = "guestbook_comments";
const PAGE_SIZE = 15;

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😘", "😎", "🤔",
  "👍", "👎", "👏", "🙏", "💪", "❤️", "🔥", "✨", "🎉", "💯",
  "😭", "😅", "🤗", "😴", "🥺", "😤", "🫡", "⚡", "🌟", "💡",
];

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let allComments = [];
let displayedCount = PAGE_SIZE;
let currentSort = "newest";
let replyTarget = null;
let previewMode = false;
let isSubmitting = false;
let unsubscribe = null;

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
};

function initFirebase() {
  if (!isFirebaseReady()) {
    showConfigBanner();
    return false;
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  els.configBanner.classList.add("hidden");

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
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

  return true;
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

function getProviderLabel(user) {
  const id = user?.providerData?.[0]?.providerId || "";
  if (id.includes("github")) return "GitHub";
  if (id.includes("google")) return "Google";
  return "访客";
}

async function loginWithProvider(name) {
  if (!auth) {
    alert("Firebase 尚未初始化，请先填写 firebase-config.js。");
    return;
  }
  const label = name === "github" ? "GitHub" : "Google";
  try {
    await signInWithPopup(auth, getAuthProvider(name));
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      alert(`${label} 登录失败：` + (err.message || "未知错误"));
    }
  }
}

async function logout() {
  if (!auth) return;
  await signOut(auth);
  clearReply();
  setPreviewMode(false);
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
  const avatar = currentUser.photoURL || "../jj_images/guest-default.svg";
  els.userAvatar.src = avatar;
  els.userAvatarMini.src = avatar;
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
  }
  updateSubmitState();
}

function hasCommentContent() {
  return els.commentInput.value.trim().length > 0;
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
          email: data.email || "",
          website: data.website || "",
          avatar: data.avatar || "../jj_images/guest-default.svg",
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
  insertAtCursor(`\n![${alt}](${trimmed})\n`);
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
  if (!items) return;

  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;

    e.preventDefault();
    const file = item.getAsFile();
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file);
      if (dataUrl.length > 500000) {
        alert("粘贴的图片太大，请改用图片链接，或将图片放到 jj_images 文件夹后填入路径。");
        return;
      }
      insertAtCursor(`\n![粘贴图片](${dataUrl})\n`);
      updateSubmitState();
    } catch (err) {
      alert("粘贴图片失败：" + (err.message || "未知错误"));
    }
    return;
  }
}

async function submitComment() {
  if (isSubmitting || !db || !currentUser) return;

  const text = els.commentInput.value;
  if (!text.trim()) return;

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

    await addDoc(collection(db, FIRESTORE_COLLECTION), {
      uid: currentUser.uid,
      author: getDisplayName(currentUser),
      email: currentUser.email || "",
      avatar: currentUser.photoURL || "",
      provider: currentUser.providerData?.[0]?.providerId || "",
      content,
      parentId,
      replyTo,
      createdAt: serverTimestamp(),
    });

    els.commentInput.value = "";
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
function insertAtCursor(text) {
  const ta = els.commentInput;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  ta.value = before + text + after;
  const pos = start + text.length;
  ta.setSelectionRange(pos, pos);
  ta.focus();
  updateSubmitState();
  if (previewMode) updatePreview();
}

function wrapSelection(before, after = before) {
  const ta = els.commentInput;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.slice(start, end);
  const wrapped = before + (selected || "代码") + after;
  ta.value = ta.value.slice(0, start) + wrapped + ta.value.slice(end);
  ta.focus();
  updateSubmitState();
  if (previewMode) updatePreview();
}

function insertLink() {
  const url = prompt("请输入链接地址：", "https://");
  if (!url) return;
  const ta = els.commentInput;
  const selected = ta.value.slice(ta.selectionStart, ta.selectionEnd) || "链接文字";
  insertAtCursor(`[${selected}](${url.trim()})`);
}

function insertCode() {
  const ta = els.commentInput;
  const selected = ta.value.slice(ta.selectionStart, ta.selectionEnd);
  if (selected) {
    wrapSelection("`", "`");
  } else {
    insertAtCursor("\n```\n代码\n```\n");
  }
}

function buildEmojiPanel() {
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
  els.commentPreview.innerHTML = renderRichContent(els.commentInput.value);
}

// ── 富文本渲染 ──────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const safeUrl = escapeHtml(url);
    const safeAlt = escapeHtml(alt);
    return `<img class="comment-inline-img" src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = escapeHtml(url);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  });
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

function renderRichContent(raw) {
  if (!raw) return "";
  const parts = [];
  const regex = /```([\s\S]*?)```/g;
  let last = 0;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: raw.slice(last, m.index) });
    parts.push({ type: "code", value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < raw.length) parts.push({ type: "text", value: raw.slice(last) });

  return parts
    .map((part) => {
      if (part.type === "code") {
        return `<pre class="comment-code"><code>${escapeHtml(part.value.trim())}</code></pre>`;
      }
      return renderInlineMarkdown(part.value);
    })
    .join("");
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
  el.innerHTML = `
    <div class="comment-head">
      <img class="comment-avatar" src="${escapeHtml(comment.avatar)}" alt=""
        loading="lazy" onerror="this.src='../jj_images/guest-default.svg'">
      <div class="comment-meta">
        <div class="comment-author-row">
          <span class="comment-author">${escapeHtml(comment.author)}</span>
          ${comment.email ? `<span class="comment-loc">${escapeHtml(comment.email)}</span>` : ""}
          <span class="comment-id">#${escapeHtml(comment.id.slice(0, 6))}</span>
        </div>
        <div class="comment-body">${renderRichContent(comment.content)}</div>
        <div class="comment-foot">
          <span>${formatTime(comment.createdAt)}</span>
          ${!isReply ? `<button type="button" class="btn-reply" data-id="${escapeHtml(comment.id)}" data-author="${escapeHtml(comment.author)}">回复</button>` : ""}
        </div>
      </div>
    </div>
  `;

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

function bindEvents() {
  els.btnLoginGoogle.addEventListener("click", () => loginWithProvider("google"));
  els.btnLoginGithub.addEventListener("click", () => loginWithProvider("github"));
  els.btnLogout.addEventListener("click", logout);
  els.btnCancelReply.addEventListener("click", clearReply);

  els.commentInput.addEventListener("input", () => {
    updateSubmitState();
    if (previewMode) updatePreview();
  });

  els.commentInput.addEventListener("paste", handlePasteImage);

  els.btnSubmit.addEventListener("click", submitComment);

  els.commentInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  });

  els.btnToolImage.addEventListener("click", insertImageByUrl);

  els.btnToolEmoji.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmojiPanel();
  });

  els.btnToolLink.addEventListener("click", insertLink);
  els.btnToolCode.addEventListener("click", insertCode);
  els.btnToolPreview.addEventListener("click", togglePreview);

  els.sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    displayedCount = PAGE_SIZE;
    renderComments();
  });

  els.btnLoadMore.addEventListener("click", () => {
    displayedCount += PAGE_SIZE;
    renderComments();
  });

  els.commentsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-reply");
    if (!btn) return;
    if (!currentUser) {
      alert("请先 Google 或 GitHub 登录后再回复。");
      return;
    }
    setReply(btn.dataset.id, btn.dataset.author);
  });

  document.addEventListener("click", (e) => {
    if (!els.emojiPanel.contains(e.target) && e.target !== els.btnToolEmoji) {
      els.emojiPanel.classList.add("hidden");
    }
  });
}

buildEmojiPanel();
bindEvents();
initFirebase();
updateAuthUI();
