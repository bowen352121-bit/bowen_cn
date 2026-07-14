/**
 * 文作搜索 — 检索 bowen-projects.js 中的文章（新增文章自动纳入索引）
 */
(function () {
  const esc = (s) =>
    window.BowenArticleFormat?.escapeHtml?.(String(s ?? "")) ?? String(s ?? "");

  function buildHaystack(article) {
    const tags = Array.isArray(article.tags) ? article.tags.join(" ") : "";
    const desc = (article.desc || "").replace(/\s+/g, " ").slice(0, 400);
    return [article.title, article.category, tags, article.lang, desc]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function scoreMatch(article, query) {
    const q = query.toLowerCase();
    const title = (article.title || "").toLowerCase();
    const category = (article.category || "").toLowerCase();
    const tags = (Array.isArray(article.tags) ? article.tags : [])
      .join(" ")
      .toLowerCase();
    let score = 0;
    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 40;
    else if (title.includes(q)) score += 25;
    if (category.includes(q)) score += 12;
    if (tags.includes(q)) score += 10;
    if ((article.desc || "").toLowerCase().includes(q)) score += 4;
    return score;
  }

  function searchProjects(projects, query, limit = 10) {
    const q = query.trim();
    if (!q || !Array.isArray(projects)) return [];
    const lower = q.toLowerCase();
    return projects
      .map((article, index) => ({ article, index, haystack: buildHaystack(article) }))
      .filter((row) => row.haystack.includes(lower))
      .map((row) => ({ ...row, score: scoreMatch(row.article, q) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, limit);
  }

  function snippet(article, query) {
    const text = (article.desc || "").replace(/\s+/g, " ");
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - 18);
      const end = Math.min(text.length, idx + query.length + 42);
      return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }
    return text.slice(0, 56) + (text.length > 56 ? "…" : "");
  }

  function createInstance({ input, results, btn, getProjects, onSelect }) {
    if (!input || !results) return null;

    let activeIdx = -1;
    let currentRows = [];
    let debounceTimer = null;

    function setOpen(open) {
      results.classList.toggle("is-open", open);
      input.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) activeIdx = -1;
    }

    function close() {
      setOpen(false);
    }

    function render(query) {
      const q = query.trim();
      if (!q) {
        results.innerHTML = "";
        setOpen(false);
        return;
      }

      const projects = getProjects() || [];
      currentRows = searchProjects(projects, q);
      activeIdx = -1;

      if (!currentRows.length) {
        results.innerHTML = `<div class="sm-search-empty">未找到「${esc(q)}」相关文章</div>`;
        setOpen(true);
        return;
      }

      results.innerHTML = currentRows
        .map((row, i) => {
          const { article } = row;
          const tags = Array.isArray(article.tags) ? article.tags.slice(0, 3) : [];
          const tagHtml = tags.length
            ? tags.map((t) => `<span class="sm-search-tag">${esc(t)}</span>`).join("")
            : `<span class="sm-search-tag">${esc(article.category || "文作")}</span>`;
          return `
            <button type="button" class="sm-search-item" role="option" data-idx="${i}" aria-selected="false">
              <span class="sm-search-item-title">${esc(article.title)}</span>
              <span class="sm-search-item-snippet">${esc(snippet(article, q))}</span>
              <span class="sm-search-item-meta">${tagHtml}</span>
            </button>`;
        })
        .join("");

      results.querySelectorAll(".sm-search-item").forEach((el) => {
        el.addEventListener("click", () => {
          const idx = Number(el.dataset.idx);
          const row = currentRows[idx];
          if (!row) return;
          input.value = "";
          close();
          onSelect(row.article, row.index);
        });
      });

      setOpen(true);
    }

    function scheduleRender() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => render(input.value), 120);
    }

    function highlightActive() {
      results.querySelectorAll(".sm-search-item").forEach((el, i) => {
        const on = i === activeIdx;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    input.addEventListener("input", scheduleRender);
    input.addEventListener("focus", () => {
      if (input.value.trim()) render(input.value);
    });

    input.addEventListener("keydown", (e) => {
      if (!results.classList.contains("is-open")) {
        if (e.key === "Enter" && input.value.trim()) render(input.value);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, currentRows.length - 1);
        highlightActive();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        highlightActive();
        return;
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        const row = currentRows[activeIdx];
        if (row) {
          input.value = "";
          close();
          onSelect(row.article, row.index);
        }
      }
    });

    btn?.addEventListener("click", () => {
      if (input.value.trim()) render(input.value);
      else input.focus();
    });

    return { close, input, results };
  }

  function init({ getProjects, onSelect, instances }) {
    const rows = (instances || [])
      .map((cfg) =>
        createInstance({
          input: document.querySelector(cfg.input),
          results: document.querySelector(cfg.results),
          btn: cfg.btn ? document.querySelector(cfg.btn) : null,
          getProjects,
          onSelect,
        }),
      )
      .filter(Boolean);

    document.addEventListener("click", (e) => {
      if (e.target.closest(".sm-search-host")) return;
      rows.forEach((r) => r.close());
    });

    return {
      closeAll() {
        rows.forEach((r) => r.close());
      },
      searchProjects,
    };
  }

  window.BowenSearch = { init, searchProjects };
})();
