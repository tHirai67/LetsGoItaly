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

  const slides = Array.from(document.querySelectorAll(".day-slide"));
  if (slides.length) {
    const count = document.querySelector("#slide-count");
    const dots = document.querySelector("#slide-dots");
    let activeSlide = 0;
    const showSlide = (index) => {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeSlide;
        slide.classList.toggle("active", active);
        slide.hidden = !active;
      });
      if (count) count.textContent = `DAY ${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (dots) {
        Array.from(dots.children).forEach((dot, dotIndex) => {
          dot.classList.toggle("active", dotIndex === activeSlide);
          dot.setAttribute("aria-current", dotIndex === activeSlide ? "step" : "false");
        });
      }
      if (history.replaceState) history.replaceState(null, "", `#${slides[activeSlide].id}`);
    };

    if (dots) {
      slides.forEach((slide, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "slide-dot";
        button.setAttribute("aria-label", `${index + 1}日目へ`);
        button.addEventListener("click", () => showSlide(index));
        dots.append(button);
      });
    }

    const hashIndex = slides.findIndex((slide) => `#${slide.id}` === location.hash);
    showSlide(hashIndex >= 0 ? hashIndex : 0);
    document.querySelector("#prev-day")?.addEventListener("click", () => showSlide(activeSlide - 1));
    document.querySelector("#next-day")?.addEventListener("click", () => showSlide(activeSlide + 1));

    document.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
      if (event.key === "ArrowRight") showSlide(activeSlide + 1);
    });

    const slider = document.querySelector("#day-slider");
    let touchStartX = null;
    slider?.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
    slider?.addEventListener("touchend", (event) => {
      if (touchStartX === null) return;
      const distance = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(distance) > 55) showSlide(activeSlide + (distance < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
  }

  const spotCards = Array.from(document.querySelectorAll(".spot-card[data-city]"));
  const cityFilter = document.querySelector("#city-filter");
  if (cityFilter && spotCards.length) {
    cityFilter.addEventListener("change", () => {
      spotCards.forEach((card) => {
        card.hidden = cityFilter.value !== "all" && card.dataset.city !== cityFilter.value;
      });
      if (cityFilter.value !== "all") activateMap(cityFilter.value);
    });
  }

  const maps = {};
  const mapSpots = {
    rome: [
      ["trevi", "トレヴィの泉", 41.9009, 12.4833], ["spanish", "スペイン広場", 41.9059, 12.4823],
      ["colosseum", "コロッセオ", 41.8902, 12.4922], ["forum", "フォロ・ロマーノ／パラティーノの丘", 41.8925, 12.4853],
      ["arch", "コンスタンティヌス帝の凱旋門", 41.8899, 12.4885], ["truth", "真実の口", 41.8884, 12.4814],
      ["vatican", "バチカン美術館", 41.9065, 12.4536], ["basilica", "サン・ピエトロ大聖堂", 41.9022, 12.4539],
      ["navona", "ナヴォーナ広場", 41.8992, 12.4731], ["pantheon", "パンテオン", 41.8986, 12.4769]
    ],
    florence: [
      ["florence-duomo", "サンタ・マリア・デル・フィオーレ大聖堂", 43.7731, 11.2560], ["uffizi", "ウフィツィ美術館", 43.7678, 11.2553],
      ["ponte-vecchio", "ヴェッキオ橋", 43.7679, 11.2531], ["signoria", "シニョリーア広場", 43.7694, 11.2559]
    ],
    venice: [
      ["san-marco", "サン・マルコ広場・大聖堂", 45.4342, 12.3388], ["doges", "ドゥカーレ宮殿", 45.4337, 12.3400],
      ["rialto", "リアルト橋", 45.4380, 12.3359], ["grand-canal", "大運河", 45.4370, 12.3270], ["dorsoduro", "ドルソドゥーロ地区", 45.4310, 12.3260]
    ]
  };
  const mapConfig = {
    rome: { center: [41.8975, 12.4705], zoom: 13, hotel: [41.9061, 12.4893] },
    florence: { center: [43.7705, 11.2530], zoom: 14, hotel: [43.7737, 11.2485] },
    venice: { center: [45.4340, 12.3320], zoom: 14, hotel: [45.4315, 12.3263] }
  };

  function initializeMap(city) {
    if (maps[city]) {
      maps[city].invalidateSize();
      return;
    }
    const target = document.querySelector(`#map-${city}`);
    if (!target) return;
    if (!window.L) {
      target.innerHTML = '<p class="map-error">地図を読み込めませんでした。インターネット接続を確認してください。<br><a href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMapを開く ↗</a></p>';
      return;
    }

    const config = mapConfig[city];
    const map = L.map(target).setView(config.center, config.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    mapSpots[city].forEach(([id, name, lat, lng]) => {
      const card = document.getElementById(id);
      const visitDate = card?.querySelector(".spot-index")?.textContent.split("·")[1]?.trim() || "";
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<strong>${name}</strong><br>${visitDate ? `訪問予定：${visitDate}<br>` : ""}<a href="#${id}" data-map-spot="${id}">詳細を見る ↗</a>`);
    });
    L.circleMarker(config.hotel, {
      radius: 8, color: "#b64337", fillColor: "#f7e7d8", fillOpacity: 1, weight: 3
    }).addTo(map).bindPopup("宿泊エリアの目安（概略位置）");
    maps[city] = map;
  }

  function activateMap(city) {
    document.querySelectorAll(".map-tab").forEach((tab) => {
      const active = tab.dataset.mapCity === city;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".map-panel").forEach((panel) => {
      const active = panel.dataset.mapPanel === city;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    initializeMap(city);
  }

  document.querySelectorAll(".map-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const city = tab.dataset.mapCity;
      activateMap(city);
      if (cityFilter) {
        cityFilter.value = city;
        spotCards.forEach((card) => { card.hidden = card.dataset.city !== city; });
      }
    });
  });
  if (document.querySelector(".map-panel")) {
    const initialCity = ["rome", "florence", "venice"].find((city) => location.hash === `#${city}-map`) || "rome";
    activateMap(initialCity);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-map-spot]");
    if (!link) return;
    const card = document.getElementById(link.dataset.mapSpot);
    if (card) card.open = true;
  });
  const linkedSpot = document.getElementById(location.hash.slice(1));
  if (linkedSpot?.matches("details.spot-card")) linkedSpot.open = true;

  const table = document.querySelector("#reservation-table");
  if (table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const search = document.querySelector("#reservation-search");
    const checks = Array.from(table.querySelectorAll('input[type="checkbox"][data-check]'));
    const progressText = document.querySelector("#progress-text");
    const progressBar = document.querySelector("#progress-bar");
    const status = document.querySelector("#reservation-status");
    const storageKey = "italia-trip-reservation-checks-v1";

    search?.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase("ja");
      rows.forEach((row) => { row.hidden = !row.textContent.toLocaleLowerCase("ja").includes(query); });
    });

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      checks.forEach((check) => { check.checked = Boolean(saved[check.dataset.check]); });
    } catch (error) {
      if (status) status.textContent = `保存済みチェックを読み込めませんでした: ${error.message}`;
    }

    const updateProgress = (persist = true) => {
      const completed = checks.filter((check) => check.checked).length;
      if (progressText) progressText.textContent = `${completed} / ${checks.length} 件`;
      if (progressBar) progressBar.style.width = `${checks.length ? completed / checks.length * 100 : 0}%`;
      if (!persist) return;
      try {
        const state = {};
        checks.forEach((check) => { state[check.dataset.check] = check.checked; });
        localStorage.setItem(storageKey, JSON.stringify(state));
        if (status) status.textContent = "";
      } catch (error) {
        if (status) status.textContent = `チェック状態を保存できませんでした: ${error.message}`;
      }
    };
    checks.forEach((check) => check.addEventListener("change", updateProgress));
    updateProgress(false);
  }

  const todoList = document.querySelector("#todo-list");
  const todoForm = document.querySelector("#todo-form");
  if (todoList && todoForm) {
    const status = document.querySelector("#todo-status");
    const count = document.querySelector("#todo-count");
    const input = document.querySelector("#todo-input");
    const exportButton = document.querySelector("#export-todos");
    const chooseImportButton = document.querySelector("#choose-import");
    const importInput = document.querySelector("#import-todos");
    const storageKey = "italia-trip-todos-v1";
    const defaults = [
      { id: "etias", text: "ETIASの申請", done: false },
      { id: "trains", text: "都市間の新幹線（高速列車）予約", done: false },
      { id: "attractions", text: "観光地の予約", done: false },
      { id: "sim", text: "SIMの準備", done: false },
      { id: "insurance", text: "海外旅行保険の加入", done: false }
    ];
    let tasks = defaults;

    const validateTasks = (value) => {
      if (!Array.isArray(value)) throw new Error("TODOデータがリスト形式ではありません。");
      const ids = new Set();
      return value.map((task) => {
        if (!task || typeof task !== "object" || typeof task.id !== "string" ||
            typeof task.text !== "string" || task.text.trim().length === 0 ||
            task.text.length > 120 || typeof task.done !== "boolean" || ids.has(task.id)) {
          throw new Error("TODOデータに不正な項目が含まれています。");
        }
        ids.add(task.id);
        return { id: task.id, text: task.text, done: task.done };
      });
    };

    const saveTasks = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        status.textContent = "";
        return true;
      } catch (error) {
        status.textContent = `タスクを保存できませんでした: ${error.message}`;
        return false;
      }
    };

    const renderTasks = () => {
      todoList.replaceChildren();
      tasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = "todo-item";
        const label = document.createElement("label");
        label.className = "todo-label";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.done);
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
          saveTasks();
          renderTasks();
        });
        const text = document.createElement("span");
        text.textContent = task.text;
        text.className = task.done ? "is-done" : "";
        label.append(checkbox, text);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "todo-remove";
        remove.textContent = "削除";
        remove.setAttribute("aria-label", `${task.text}を削除`);
        remove.addEventListener("click", () => {
          tasks = tasks.filter((entry) => entry.id !== task.id);
          saveTasks();
          renderTasks();
        });
        item.append(label, remove);
        todoList.append(item);
      });
      const completed = tasks.filter((task) => task.done).length;
      count.textContent = `${completed} / ${tasks.length} 完了`;
    };

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        tasks = validateTasks(parsed);
      }
    } catch (error) {
      status.textContent = `保存済みTODOを読み込めませんでした: ${error.message}`;
    }

    exportButton?.addEventListener("click", () => {
      try {
        const data = {
          format: "italy-trip-todos",
          version: 1,
          exportedAt: new Date().toISOString(),
          tasks
        };
        const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "italy-trip-todos.json";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = "TODO共有ファイルを書き出しました。相手にファイルを送ってください。";
      } catch (error) {
        status.textContent = `共有ファイルを書き出せませんでした: ${error.message}`;
      }
    });

    chooseImportButton?.addEventListener("click", () => importInput?.click());
    importInput?.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        if (file.size > 1024 * 1024) throw new Error("ファイルサイズは1MB以下にしてください。");
        const data = JSON.parse(await file.text());
        if (data?.format !== "italy-trip-todos" || data.version !== 1) {
          throw new Error("対応していないTODO共有ファイルです。");
        }
        tasks = validateTasks(data.tasks);
        const saved = saveTasks();
        renderTasks();
        if (saved) status.textContent = "TODO共有ファイルを読み込みました。現在のリストを置き換えました。";
      } catch (error) {
        status.textContent = `TODO共有ファイルを読み込めませんでした: ${error.message}`;
      } finally {
        importInput.value = "";
      }
    });

    todoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        status.textContent = "タスクの内容を入力してください。";
        input.focus();
        return;
      }
      tasks.push({ id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, done: false });
      input.value = "";
      saveTasks();
      renderTasks();
      input.focus();
    });
    renderTasks();
  }
});
