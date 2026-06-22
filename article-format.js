/**
 * 文章正文段落 · 每段首行缩进两字（2em）
 */
(function (global) {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function splitParagraphs(desc) {
    return String(desc || "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  function renderDescHtml(desc) {
    const parts = splitParagraphs(desc);
    if (!parts.length) return "";
    return parts.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }

  function applyDescToElement(el, desc) {
    if (!el) return;
    el.classList.add("article-body");
    el.innerHTML = renderDescHtml(desc);
  }

  function formatPublishDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(String(dateStr).length <= 10 ? `${dateStr}T12:00:00` : dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  global.BowenArticleFormat = {
    escapeHtml,
    splitParagraphs,
    renderDescHtml,
    applyDescToElement,
    formatPublishDate,
  };
})(window);
