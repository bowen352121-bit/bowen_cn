/**
 * 景教留言板 · Firebase v10 模块化
 * 依赖：景教/firebase-config.js（填入你的 Config）
 * 页面：景教/jingjiao.html（底部已引入本文件）
 */
import { firebaseConfig, isFirebaseReady } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
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

// ── 常量 ──────────────────────────────────────────────
const FIRESTORE_COLLECTION = "guestbook_comments";
const PAGE_SIZE = 15;

// ── Firebase 初始化 ───────────────────────────────────
let app = null;
let auth = null;
let db = null;
let currentUser = null;
let allComments = [];
let displayedCount = PAGE_SIZE;
let replyTarget = null;

const els = {
  configBanner: document.getElementById("config-banner"),
  authPanel: document.getElementById("auth-panel"),
  composePanel: document.getElementById("compose-panel"),
  btnLoginGoogle: document.getElementById("btn-login-google"),
  btnLogout: document.getElementById("btn-logout"),
  userAvatar: document.getElementById("user-avatar"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  commentInput: document.getElementById("comment-input"),
  btnSubmit: document.getElementById("btn-submit"),
  replyIndicator: document.getElementById("reply-indicator"),
  replyTargetName: document.getElementById("reply-target-name"),
  btnCancelReply: document.getElementById("btn-cancel-reply"),
  commentsList: document.getElementById("comments-list"),
  commentTotal: document.getElementById("comment-total"),
  sidebarCommentCount: document.getElementById("sidebar-comment-count"),
  btnLoadMore: document.getElementById("btn-load-more"),
  commentsEmpty: document.getElementById("comments-empty"),
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
        '<p class="comments-error">请先 Google 登录后查看与发表留言。</p>';
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

// ── Google 登录 ─────────────────────────────────────────
async function loginWithGoogle() {
  if (!auth) {
    alert("Firebase 尚未初始化，请先填写 firebase-config.js。");
    return;
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("登录成功：", {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      alert("Google 登录失败：" + (err.message || "未知错误"));
    }
  }
}

async function logout() {
  if (!auth) return;
  await signOut(auth);
  clearReply();
}

function updateAuthUI() {
  if (currentUser) {
    els.authPanel.classList.add("hidden");
    els.composePanel.classList.remove("hidden");
    els.userName.textContent = currentUser.displayName || "Google 用户";
    els.userEmail.textContent = currentUser.email || "";
    els.userAvatar.src = currentUser.photoURL || "../jj_images/guest-default.svg";
    els.userAvatar.alt = currentUser.displayName || "头像";
  } else {
    els.authPanel.classList.remove("hidden");
    els.composePanel.classList.add("hidden");
  }
  updateSubmitState();
}

function updateSubmitState() {
  const hasText = els.commentInput.value.trim().length > 0;
  els.btnSubmit.disabled = !currentUser || !hasText;
}

// ── Firestore 实时留言 ──────────────────────────────────
let unsubscribe = null;

function subscribeComments() {
  if (!db) return;

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const q = query(
    collection(db, FIRESTORE_COLLECTION),
    orderBy("createdAt", "desc")
  );

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
      if (err.code === "permission-denied") {
        els.commentsList.innerHTML =
          '<p class="comments-error">无法读取留言：Firestore 安全规则要求登录。请先点击 Google 登录。</p>';
      } else {
        els.commentsList.innerHTML =
          `<p class="comments-error">留言加载失败：${escapeHtml(err.message)}</p>`;
      }
    }
  );
}

// ── 提交留言 ────────────────────────────────────────────
async function submitComment() {
  if (!db || !currentUser) return;

  const text = els.commentInput.value.trim();
  if (!text) return;

  els.btnSubmit.disabled = true;
  els.btnSubmit.textContent = "发表中…";

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
      author: currentUser.displayName || "Google 用户",
      email: currentUser.email || "",
      avatar: currentUser.photoURL || "",
      content,
      parentId,
      replyTo,
      createdAt: serverTimestamp(),
    });

    els.commentInput.value = "";
    clearReply();
  } catch (err) {
    alert("发表失败：" + (err.message || "未知错误"));
  } finally {
    els.btnSubmit.textContent = "发表留言";
    updateSubmitState();
  }
}

// ── 渲染 ────────────────────────────────────────────────
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
        <div class="comment-body">${escapeHtml(comment.content)}</div>
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
  const roots = getRootComments();
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

// ── 事件绑定 ────────────────────────────────────────────
function bindEvents() {
  els.btnLoginGoogle.addEventListener("click", loginWithGoogle);
  els.btnLogout.addEventListener("click", logout);
  els.btnCancelReply.addEventListener("click", clearReply);
  els.commentInput.addEventListener("input", updateSubmitState);
  els.btnSubmit.addEventListener("click", submitComment);

  els.btnLoadMore.addEventListener("click", () => {
    displayedCount += PAGE_SIZE;
    renderComments();
  });

  els.commentsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-reply");
    if (!btn) return;
    if (!currentUser) {
      alert("请先 Google 登录后再回复。");
      return;
    }
    setReply(btn.dataset.id, btn.dataset.author);
  });
}

// ── 启动 ────────────────────────────────────────────────
bindEvents();
if (initFirebase()) {
  updateAuthUI();
} else {
  updateAuthUI();
}
