/**
 * 侧边栏日历 · 按系统真实日期渲染，支持前后翻月
 */
(function () {
  const TODAY = startOfDay(new Date());

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatHeader(year, month) {
    const isCurrentMonth =
      year === TODAY.getFullYear() && month === TODAY.getMonth();
    if (isCurrentMonth) {
      return `${TODAY.getFullYear()} 年 ${TODAY.getMonth() + 1} 月 ${TODAY.getDate()} 日`;
    }
    return `${year} 年 ${month + 1} 月`;
  }

  function buildMonthGrid(year, month) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startPad = (first.getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = startPad - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, other: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        day,
        other: false,
        date: new Date(year, month, day),
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay++, other: true });
    }

    return cells;
  }

  function getDateLabel(root) {
    return (
      root.querySelector(".sm-calendar-date") ||
      root.querySelector(".calendar-head > div")
    );
  }

  function getDaysContainer(root) {
    return root.querySelector(".sm-calendar-days") || root.querySelector(".calendar-days");
  }

  function renderSmDays(container, cells) {
    container.innerHTML = cells
      .map((cell) => {
        if (!cell.other && cell.date && isSameDay(cell.date, TODAY)) {
          return `<div class="is-today"><span>${cell.day}</span></div>`;
        }
        const cls = cell.other ? "is-other" : "";
        return cls ? `<div class="${cls}">${cell.day}</div>` : `<div>${cell.day}</div>`;
      })
      .join("");
  }

  function renderJingjiaoDays(container, cells) {
    container.innerHTML = cells
      .map((cell) => {
        if (!cell.other && cell.date && isSameDay(cell.date, TODAY)) {
          return `<span class="today">${cell.day}</span>`;
        }
        const cls = cell.other ? "other" : "";
        return cls ? `<span class="${cls}">${cell.day}</span>` : `<span>${cell.day}</span>`;
      })
      .join("");
  }

  function initCalendar(root) {
    const isSm = root.classList.contains("sm-calendar");
    const dateEl = getDateLabel(root);
    const daysEl = getDaysContainer(root);
    if (!dateEl || !daysEl) return;

    let viewYear = TODAY.getFullYear();
    let viewMonth = TODAY.getMonth();

    const head = root.querySelector(".sm-calendar-head, .calendar-head");
    const buttons = head ? head.querySelectorAll("button") : [];
    const prevBtn = buttons[0];
    const nextBtn = buttons[1];

    function render() {
      dateEl.textContent = formatHeader(viewYear, viewMonth);
      const cells = buildMonthGrid(viewYear, viewMonth);
      if (isSm) renderSmDays(daysEl, cells);
      else renderJingjiaoDays(daysEl, cells);
    }

    prevBtn?.addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      render();
    });

    nextBtn?.addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      render();
    });

    render();
  }

  function boot() {
    document.querySelectorAll(".sm-calendar, .calendar-widget").forEach(initCalendar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
