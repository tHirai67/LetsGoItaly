document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });
  }

  // 観光スポットページ：エリア絞り込み
  const areaFilter = document.querySelector("#area-filter");
  const spotCards = document.querySelectorAll(".spot-card");
  if (areaFilter && spotCards.length) {
    areaFilter.addEventListener("change", () => {
      const selected = areaFilter.value;
      spotCards.forEach((card) => {
        card.hidden = selected !== "all" && card.dataset.area !== selected;
      });
    });
  }

  // 予約リスト：施設名検索
  const search = document.querySelector("#reservation-search");
  const table = document.querySelector("#reservation-table");
  if (search && table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase("ja");
      rows.forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase("ja").includes(query);
      });
    });

    // チェックリストの進捗表示（保存先はこのブラウザのみ）
    const checks = Array.from(table.querySelectorAll('input[type="checkbox"][data-check]'));
    const progressText = document.querySelector("#progress-text");
    const progressBar = document.querySelector("#progress-bar");
    const storageKey = "roma-trip-reservation-checks-v1";

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      checks.forEach((check) => {
        check.checked = Boolean(saved[check.dataset.check]);
      });
    } catch (_) {
      // localStorageが利用できない場合も、画面上のチェック操作は可能
    }

    const updateProgress = () => {
      const completed = checks.filter((check) => check.checked).length;
      if (progressText) progressText.textContent = `${completed} / ${checks.length} 件`;
      if (progressBar) progressBar.style.width = `${checks.length ? completed / checks.length * 100 : 0}%`;
      try {
        const state = {};
        checks.forEach((check) => { state[check.dataset.check] = check.checked; });
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (_) {
        // 保存できない環境ではページを閉じると状態がリセットされます
      }
    };
    checks.forEach((check) => check.addEventListener("change", updateProgress));
    updateProgress();
  }
});
