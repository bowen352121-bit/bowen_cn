/**
 * 全站统计 — 「全站文章」读取 bowen-projects.js 中的 bowenProjects.length
 */
(function () {
  function getArticleCount() {
    return window.bowenProjects?.length ?? 0;
  }

  function applySiteStats() {
    const count = getArticleCount();
    document.querySelectorAll('[data-site-stat="articles"]').forEach((el) => {
      el.textContent = count;
    });
  }

  window.BowenSiteStats = {
    getArticleCount,
    apply: applySiteStats,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySiteStats);
  } else {
    applySiteStats();
  }
})();
