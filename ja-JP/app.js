// Windows 11 シミュレーター (ja-JP)
(() => {
  "use strict";

  // 初期仮想ファイルシステム
  const defaultFS = {
    "デスクトップ": [
      { name: "ようこそ.txt", type: "file", content: "Windows 11 シミュレーター (ja-JP) へようこそ！\n\nこのシミュレーターでは、スタートメニュー、タスクバー、エクスプローラー、メモ帳、電卓、設定、Microsoft Edge、ターミナル、ペイント、タスク マネージャーなどをブラウザ上で体験できます。" },
      { name: "プロジェクト資料", type: "folder", children: [
        { name: "仕様書メモ.txt", type: "file", content: "・対応ロケール: ja-JP (日本語)\n・デザイン: Fluent Design / Mica スタイル\n・状態保存: localStorage 対応" }
      ]}
    ],
    "ドキュメント": [
      { name: "議事録_2026年11月.txt", type: "file", content: "日時: 2026年11月25日\n議題: Windows 11 日本語UIシミュレーターの機能確認\n決定事項: すべての標準アプリとクイック設定を実装完了。" },
      { name: "ショートカット一覧.txt", type: "file", content: "・Win / Alt+S: スタートメニュー開閉\n・F5: デスクトップ更新\n・右クリック: コンテキストメニュー表示" }
    ],
    "ダウンロード": [
      { name: "Windows11_ガイド.txt", type: "file", content: "ダウンロード済みのサンプルガイドファイルです。" }
    ],
    "ピクチャ": [
      { name: "サンプル壁紙情報.txt", type: "file", content: "設定アプリの「個人用設定」から壁紙とダークテーマを切り替えられます。" }
    ],
    "ごみ箱": []
  };

  let vfs = JSON.parse(localStorage.getItem("win11_ja_vfs") || "null") || structuredClone(defaultFS);
  function saveVFS() {
    localStorage.setItem("win11_ja_vfs", JSON.stringify(vfs));
  }

  // アプリ定義
  const APPS = [
    { id: "explorer", name: "エクスプローラー", icon: "📁", pinned: true, desktop: true, w: 720, h: 460 },
    { id: "edge", name: "Microsoft Edge", icon: "🌐", pinned: true, desktop: true, w: 780, h: 500 },
    { id: "notepad", name: "メモ帳", icon: "📝", pinned: true, desktop: true, w: 600, h: 420 },
    { id: "calc", name: "電卓", icon: "🧮", pinned: true, desktop: true, w: 340, h: 480 },
    { id: "settings", name: "設定", icon: "⚙️", pinned: true, desktop: true, w: 740, h: 490 },
    { id: "terminal", name: "ターミナル", icon: "💻", pinned: true, desktop: true, w: 640, h: 400 },
    { id: "paint", name: "ペイント", icon: "🎨", pinned: true, desktop: true, w: 680, h: 470 },
    { id: "taskmgr", name: "タスク マネージャー", icon: "📊", pinned: true, desktop: false, w: 620, h: 430 },
    { id: "recycle", name: "ごみ箱", icon: "🗑️", pinned: false, desktop: true, w: 580, h: 380 }
  ];

  // 通知リスト
  let notifications = [
    { title: "Windows セキュリティ", body: "デバイスは保護されています。問題は見つかりませんでした。", time: "たった今" },
    { title: "Microsoft IME", body: "日本語入力システム (ja-JP) が有効になっています。", time: "2分前" }
  ];

  // 状態管理
  let openWindows = [];
  let topZ = 100;
  let calOffset = 0;
  let imeJapanese = true;

  // 日時更新 (ja-JP)
  const weekdaysJa = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  function updateClocks() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const w = weekdaysJa[now.getDay()];

    document.getElementById("lock-time").textContent = `${hh}:${mm}`;
    document.getElementById("lock-date").textContent = `${m}月${d}日 ${w}`;
    document.getElementById("tb-time").textContent = `${hh}:${mm}`;
    document.getElementById("tb-date").textContent = `${yyyy}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
    document.getElementById("cal-full-date").textContent = `${yyyy}年${m}月${d}日 ${w}`;
    document.getElementById("widgets-date-title").textContent = `${yyyy}年${m}月${d}日 (${w[0]})`;
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  // ロック画面制御
  const lockScreen = document.getElementById("lock-screen");
  const lockClockView = document.getElementById("lock-clock-view");
  const lockLoginView = document.getElementById("lock-login-view");
  const loginPin = document.getElementById("login-pin");

  function showLoginForm() {
    lockClockView.classList.add("hidden");
    lockLoginView.classList.remove("hidden");
    loginPin.focus();
  }

  function unlockDesktop() {
    lockScreen.classList.add("unlocked");
    loginPin.value = "";
  }

  lockClockView.addEventListener("click", showLoginForm);
  document.getElementById("login-submit").addEventListener("click", unlockDesktop);
  loginPin.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockDesktop();
  });
  document.addEventListener("keydown", (e) => {
    if (!lockScreen.classList.contains("unlocked") && lockLoginView.classList.contains("hidden")) {
      if (e.code === "Space" || e.key === "Enter") showLoginForm();
    }
  });

  // デスクトップアイコン描画
  const desktopIconsEl = document.getElementById("desktop-icons");
  function renderDesktopIcons() {
    desktopIconsEl.innerHTML = "";
    APPS.filter(a => a.desktop).forEach(app => {
      const el = document.createElement("div");
      el.className = "desktop-icon";
      el.innerHTML = `<div class="icon-emoji">${app.icon}</div><div class="icon-label">${app.name}</div>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
        el.classList.add("selected");
      });
      el.addEventListener("dblclick", () => openApp(app.id));
      desktopIconsEl.appendChild(el);
    });
  }
  renderDesktopIcons();

  // スタートメニュー構築
  const startPinnedGrid = document.getElementById("start-pinned-grid");
  const startRecommendedList = document.getElementById("start-recommended-list");
  const startSearchInput = document.getElementById("start-search-input");

  function renderStartMenu(filter = "") {
    const q = filter.trim().toLowerCase();
    startPinnedGrid.innerHTML = "";
    APPS.filter(a => !q || a.name.toLowerCase().includes(q) || a.id.includes(q)).forEach(app => {
      const item = document.createElement("div");
      item.className = "start-app-item";
      item.innerHTML = `<div class="app-emoji">${app.icon}</div><div class="app-name">${app.name}</div>`;
      item.addEventListener("click", () => {
        closeAllFlyouts();
        openApp(app.id);
      });
      startPinnedGrid.appendChild(item);
    });

    const recs = [
      { icon: "📄", title: "ようこそ.txt", sub: "デスクトップ", action: () => openNotepadWithFile("ようこそ.txt", vfs["デスクトップ"][0].content) },
      { icon: "📄", title: "議事録_2026年11月.txt", sub: "ドキュメント", action: () => openNotepadWithFile("議事録_2026年11月.txt", vfs["ドキュメント"][0].content) },
      { icon: "⚙️", title: "個人用設定とテーマ", sub: "設定", action: () => openApp("settings") },
      { icon: "💻", title: "Windows ターミナル", sub: "コマンド ライン", action: () => openApp("terminal") }
    ];
    startRecommendedList.innerHTML = "";
    recs.forEach(r => {
      const el = document.createElement("div");
      el.className = "rec-item";
      el.innerHTML = `<span style="font-size:22px">${r.icon}</span><div class="rec-item-info"><span class="rec-item-title">${r.title}</span><span class="rec-item-sub">${r.sub}</span></div>`;
      el.addEventListener("click", () => {
        closeAllFlyouts();
        r.action();
      });
      startRecommendedList.appendChild(el);
    });
  }
  renderStartMenu();
  startSearchInput.addEventListener("input", (e) => renderStartMenu(e.target.value));

  // フライアウト制御
  const flyouts = ["start-menu", "widgets-panel", "quick-settings", "notification-center", "context-menu"];
  function closeAllFlyouts() {
    flyouts.forEach(id => document.getElementById(id).classList.add("hidden"));
    document.getElementById("power-menu").classList.add("hidden");
  }

  function toggleFlyout(id) {
    const target = document.getElementById(id);
    const wasHidden = target.classList.contains("hidden");
    closeAllFlyouts();
    if (wasHidden) {
      target.classList.remove("hidden");
      if (id === "start-menu") {
        startSearchInput.value = "";
        renderStartMenu();
        setTimeout(() => startSearchInput.focus(), 50);
      }
      if (id === "notification-center") {
        renderNotifications();
        renderCalendar();
      }
    }
  }

  document.getElementById("tb-start-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleFlyout("start-menu"); });
  document.getElementById("tb-search-pill").addEventListener("click", (e) => { e.stopPropagation(); toggleFlyout("start-menu"); });
  document.getElementById("tb-widgets-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleFlyout("widgets-panel"); });
  document.getElementById("tb-qs-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleFlyout("quick-settings"); });
  document.getElementById("tb-clock-btn").addEventListener("click", (e) => { e.stopPropagation(); toggleFlyout("notification-center"); });

  document.querySelectorAll(".flyout-panel").forEach(p => {
    p.addEventListener("click", (e) => e.stopPropagation());
  });

  document.getElementById("desktop").addEventListener("click", () => {
    closeAllFlyouts();
    document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
  });

  // IME 切替
  const imeBtn = document.getElementById("tb-ime-btn");
  imeBtn.addEventListener("click", () => {
    imeJapanese = !imeJapanese;
    imeBtn.textContent = imeJapanese ? "あ" : "A";
    pushNotification("Microsoft IME", imeJapanese ? "入力モード: ひらがな (ja-JP)" : "入力モード: 半角英数");
  });

  // クイック設定
  document.querySelectorAll(".qs-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      tile.classList.toggle("active");
      const key = tile.dataset.qs;
      if (key === "night") {
        document.getElementById("night-light-overlay").classList.toggle("active", tile.classList.contains("active"));
      } else if (key === "theme") {
        document.body.classList.toggle("theme-dark", tile.classList.contains("active"));
        document.body.classList.toggle("theme-light", !tile.classList.contains("active"));
      }
    });
  });

  document.getElementById("brightness-slider").addEventListener("input", (e) => {
    const val = e.target.value;
    document.getElementById("brightness-val").textContent = `${val}%`;
    document.getElementById("desktop").style.filter = `brightness(${val}%)`;
  });

  document.getElementById("volume-slider").addEventListener("input", (e) => {
    document.getElementById("volume-val").textContent = `${e.target.value}%`;
  });

  document.getElementById("qs-open-settings").addEventListener("click", () => {
    closeAllFlyouts();
    openApp("settings");
  });

  // 電源メニュー
  document.getElementById("start-power-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("power-menu").classList.toggle("hidden");
  });

  document.querySelectorAll(".power-item").forEach(item => {
    item.addEventListener("click", () => {
      const action = item.dataset.power;
      closeAllFlyouts();
      const powerScreen = document.getElementById("power-screen");
      const statusText = document.getElementById("power-status-text");
      const powerOnBtn = document.getElementById("power-on-btn");
      const spinner = powerScreen.querySelector(".boot-spinner");

      if (action === "lock") {
        lockClockView.classList.remove("hidden");
        lockLoginView.classList.add("hidden");
        lockScreen.classList.remove("unlocked");
      } else if (action === "sleep") {
        powerScreen.classList.remove("hidden");
        spinner.classList.add("hidden");
        statusText.textContent = "スリープ中...";
        powerOnBtn.textContent = "スリープ解除";
        powerOnBtn.classList.remove("hidden");
      } else if (action === "shutdown") {
        powerScreen.classList.remove("hidden");
        spinner.classList.remove("hidden");
        powerOnBtn.classList.add("hidden");
        statusText.textContent = "シャットダウンしています...";
        setTimeout(() => {
          spinner.classList.add("hidden");
          statusText.textContent = "電源がオフになりました";
          powerOnBtn.textContent = "電源を入れる";
          powerOnBtn.classList.remove("hidden");
        }, 1600);
      } else if (action === "restart") {
        powerScreen.classList.remove("hidden");
        spinner.classList.remove("hidden");
        powerOnBtn.classList.add("hidden");
        statusText.textContent = "再起動しています...";
        setTimeout(() => {
          powerScreen.classList.add("hidden");
          lockClockView.classList.remove("hidden");
          lockLoginView.classList.add("hidden");
          lockScreen.classList.remove("unlocked");
        }, 2000);
      }
    });
  });

  document.getElementById("power-on-btn").addEventListener("click", () => {
    document.getElementById("power-screen").classList.add("hidden");
  });

  // 通知とカレンダー
  function pushNotification(title, body) {
    notifications.unshift({ title, body, time: "たった今" });
    renderNotifications();
  }

  function renderNotifications() {
    const list = document.getElementById("notif-list");
    if (!notifications.length) {
      list.innerHTML = `<div class="notif-empty">新しい通知はありません</div>`;
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div class="notif-item">
        <div class="notif-item-title">${n.title} <span style="font-weight:400;opacity:0.6;float:right">${n.time}</span></div>
        <div>${n.body}</div>
      </div>
    `).join("");
  }

  document.getElementById("clear-notifs-btn").addEventListener("click", () => {
    notifications = [];
    renderNotifications();
  });

  function renderCalendar() {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + calOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    document.getElementById("cal-month-label").textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const container = document.getElementById("cal-days");
    container.innerHTML = "";

    for (let i = firstDay - 1; i >= 0; i--) {
      const span = document.createElement("span");
      span.className = "cal-day muted";
      span.textContent = prevDays - i;
      container.appendChild(span);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const span = document.createElement("span");
      span.className = "cal-day";
      if (calOffset === 0 && d === now.getDate()) span.classList.add("today");
      span.textContent = d;
      container.appendChild(span);
    }
  }
  document.getElementById("cal-prev").addEventListener("click", () => { calOffset--; renderCalendar(); });
  document.getElementById("cal-next").addEventListener("click", () => { calOffset++; renderCalendar(); });

  // 右クリックコンテキストメニュー
  const ctxMenu = document.getElementById("context-menu");
  document.getElementById("desktop").addEventListener("contextmenu", (e) => {
    if (e.target.closest(".win-window") || e.target.closest(".taskbar") || e.target.closest(".flyout-panel")) return;
    e.preventDefault();
    closeAllFlyouts();
    ctxMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 230)}px`;
    ctxMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 260)}px`;
    ctxMenu.classList.remove("hidden");
  });

  ctxMenu.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    closeAllFlyouts();
    if (action === "view-toggle") desktopIconsEl.classList.toggle("large");
    if (action === "refresh") renderDesktopIcons();
    if (action === "new-folder") {
      const name = `新しいフォルダー (${vfs["デスクトップ"].length + 1})`;
      vfs["デスクトップ"].push({ name, type: "folder", children: [] });
      saveVFS();
      pushNotification("エクスプローラー", `デスクトップに「${name}」を作成しました。`);
    }
    if (action === "new-txt") {
      const name = `新規テキスト_${Date.now().toString().slice(-4)}.txt`;
      vfs["デスクトップ"].push({ name, type: "file", content: "" });
      saveVFS();
      openNotepadWithFile(name, "");
    }
    if (action === "open-settings") openApp("settings");
    if (action === "open-terminal") openApp("terminal");
  });

  // タスクバーのピン留め＆実行中アプリ管理
  const tbAppsEl = document.getElementById("tb-apps");
  function renderTaskbarApps() {
    tbAppsEl.innerHTML = "";
    const shownIds = new Set(APPS.filter(a => a.pinned).map(a => a.id));
    openWindows.forEach(w => shownIds.add(w.appId));

    shownIds.forEach(appId => {
      const app = APPS.find(a => a.id === appId);
      if (!app) return;
      const win = openWindows.find(w => w.appId === appId);
      const btn = document.createElement("button");
      btn.className = "tb-icon-btn";
      if (win) {
        btn.classList.add("open");
        if (!win.minimized && win.z === topZ) btn.classList.add("focused");
      }
      btn.title = app.name;
      btn.textContent = app.icon;
      btn.addEventListener("click", () => {
        if (!win) {
          openApp(appId);
        } else if (win.minimized) {
          win.minimized = false;
          win.el.classList.remove("minimized");
          focusWindow(win.id);
        } else if (win.z === topZ) {
          win.minimized = true;
          win.el.classList.add("minimized");
          renderTaskbarApps();
        } else {
          focusWindow(win.id);
        }
      });
      tbAppsEl.appendChild(btn);
    });
  }
  renderTaskbarApps();

  document.getElementById("tb-show-desktop").addEventListener("click", () => {
    const anyVisible = openWindows.some(w => !w.minimized);
    openWindows.forEach(w => {
      w.minimized = anyVisible;
      w.el.classList.toggle("minimized", anyVisible);
    });
    renderTaskbarApps();
  });

  // ウィンドウ生成＆管理
  const windowsContainer = document.getElementById("windows-container");

  function focusWindow(winId) {
    const win = openWindows.find(w => w.id === winId);
    if (!win) return;
    topZ++;
    win.z = topZ;
    win.el.style.zIndex = topZ;
    renderTaskbarApps();
  }

  function closeWindow(winId) {
    const idx = openWindows.findIndex(w => w.id === winId);
    if (idx === -1) return;
    openWindows[idx].el.remove();
    openWindows.splice(idx, 1);
    renderTaskbarApps();
  }

  function openApp(appId, customInit = null) {
    const existing = openWindows.find(w => w.appId === appId && !customInit);
    if (existing) {
      existing.minimized = false;
      existing.el.classList.remove("minimized");
      focusWindow(existing.id);
      return existing;
    }

    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const winId = `win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const offset = (openWindows.length % 6) * 26;
    const el = document.createElement("div");
    el.className = "win-window";
    el.style.width = `${app.w}px`;
    el.style.height = `${app.h}px`;
    el.style.left = `${Math.max(20, (window.innerWidth - app.w) / 2 + offset)}px`;
    el.style.top = `${Math.max(20, (window.innerHeight - app.h - 48) / 2 + offset)}px`;

    topZ++;
    el.style.zIndex = topZ;

    el.innerHTML = `
      <div class="win-titlebar">
        <div class="win-title-info">
          <span>${app.icon}</span>
          <span class="win-title-text">${app.name}</span>
        </div>
        <div class="win-controls">
          <button class="win-ctrl-btn min" title="最小化">—</button>
          <button class="win-ctrl-btn max" title="最大化">□</button>
          <button class="win-ctrl-btn close" title="閉じる">✕</button>
        </div>
      </div>
      <div class="win-body"></div>
      <div class="win-resize-handle"></div>
    `;

    const winObj = { id: winId, appId, el, z: topZ, minimized: false };
    openWindows.push(winObj);
    windowsContainer.appendChild(el);

    el.addEventListener("mousedown", () => focusWindow(winId));
    el.querySelector(".min").addEventListener("click", (e) => {
      e.stopPropagation();
      winObj.minimized = true;
      el.classList.add("minimized");
      renderTaskbarApps();
    });
    el.querySelector(".max").addEventListener("click", (e) => {
      e.stopPropagation();
      el.classList.toggle("maximized");
    });
    el.querySelector(".close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow(winId);
    });

    // ドラッグ移動
    const titlebar = el.querySelector(".win-titlebar");
    titlebar.addEventListener("dblclick", () => el.classList.toggle("maximized"));
    titlebar.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win-controls") || el.classList.contains("maximized")) return;
      const startX = e.clientX - el.offsetLeft;
      const startY = e.clientY - el.offsetTop;
      function onMove(ev) {
        el.style.left = `${ev.clientX - startX}px`;
        el.style.top = `${Math.max(0, ev.clientY - startY)}px`;
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // リサイズ
    const resizeHandle = el.querySelector(".win-resize-handle");
    resizeHandle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      const startW = el.offsetWidth;
      const startH = el.offsetHeight;
      const startX = e.clientX;
      const startY = e.clientY;
      function onResize(ev) {
        el.style.width = `${Math.max(340, startW + (ev.clientX - startX))}px`;
        el.style.height = `${Math.max(240, startH + (ev.clientY - startY))}px`;
      }
      function onUp() {
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onResize);
      document.addEventListener("mouseup", onUp);
    });

    const body = el.querySelector(".win-body");
    mountAppContent(appId, body, winObj, customInit);
    renderTaskbarApps();
    return winObj;
  }

  function openNotepadWithFile(filename, content) {
    const win = openApp("notepad", { filename, content });
    if (win) {
      win.el.querySelector(".win-title-text").textContent = `${filename} - メモ帳`;
    }
  }

  // 各アプリの中身実装
  function mountAppContent(appId, body, winObj, customInit) {
    if (appId === "explorer" || appId === "recycle") {
      let currentFolder = appId === "recycle" ? "ごみ箱" : "デスクトップ";
      body.innerHTML = `
        <div class="explorer-toolbar">
          <button class="pill-btn exp-new-folder">+ 新規フォルダー</button>
          <div class="exp-path">PC &gt; ${currentFolder}</div>
        </div>
        <div class="explorer-main">
          <div class="explorer-sidebar">
            ${["デスクトップ", "ドキュメント", "ダウンロード", "ピクチャ", "ごみ箱"].map(f =>
              `<div class="exp-nav-item ${f === currentFolder ? "active" : ""}" data-folder="${f}">📁 ${f}</div>`
            ).join("")}
          </div>
          <div class="explorer-content"></div>
        </div>
      `;
      const contentEl = body.querySelector(".explorer-content");
      const pathEl = body.querySelector(".exp-path");

      function renderFolder() {
        pathEl.textContent = `PC > ${currentFolder}`;
        body.querySelectorAll(".exp-nav-item").forEach(n => n.classList.toggle("active", n.dataset.folder === currentFolder));
        const items = vfs[currentFolder] || [];
        if (!items.length) {
          contentEl.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px;">このフォルダーは空です</div>`;
          return;
        }
        contentEl.innerHTML = items.map((it, idx) => `
          <div class="exp-item" data-idx="${idx}">
            <div class="exp-item-icon">${it.type === "folder" ? "📁" : "📄"}</div>
            <div>${it.name}</div>
          </div>
        `).join("");

        contentEl.querySelectorAll(".exp-item").forEach(el => {
          el.addEventListener("dblclick", () => {
            const item = items[Number(el.dataset.idx)];
            if (item.type === "file") {
              openNotepadWithFile(item.name, item.content || "");
            } else {
              pushNotification("エクスプローラー", `フォルダー「${item.name}」を開きました (${(item.children || []).length} 項目)`);
            }
          });
        });
      }

      body.querySelectorAll(".exp-nav-item").forEach(nav => {
        nav.addEventListener("click", () => {
          currentFolder = nav.dataset.folder;
          renderFolder();
        });
      });

      body.querySelector(".exp-new-folder").addEventListener("click", () => {
        const name = `新しいフォルダー_${(vfs[currentFolder].length + 1)}`;
        vfs[currentFolder].push({ name, type: "folder", children: [] });
        saveVFS();
        renderFolder();
      });

      renderFolder();
    }

    else if (appId === "notepad") {
      let currentFile = customInit?.filename || "無題.txt";
      body.innerHTML = `
        <div class="notepad-toolbar">
          <button class="pill-btn np-new">新規</button>
          <button class="pill-btn np-save">デスクトップに保存</button>
          <span style="margin-left:auto;color:var(--text-secondary)" class="np-fname">${currentFile}</span>
        </div>
        <textarea class="notepad-area" placeholder="ここに入力してください...">${customInit?.content || ""}</textarea>
        <div class="notepad-status">
          <span class="np-count">文字数: 0</span>
          <span>UTF-8 | CRLF | 日本語 (ja-JP)</span>
        </div>
      `;
      const area = body.querySelector(".notepad-area");
      const countEl = body.querySelector(".np-count");
      const updateCount = () => { countEl.textContent = `文字数: ${area.value.length}`; };
      updateCount();
      area.addEventListener("input", updateCount);

      body.querySelector(".np-new").addEventListener("click", () => {
        area.value = "";
        currentFile = "無題.txt";
        body.querySelector(".np-fname").textContent = currentFile;
        updateCount();
      });

      body.querySelector(".np-save").addEventListener("click", () => {
        if (currentFile === "無題.txt") {
          currentFile = `メモ_${Date.now().toString().slice(-4)}.txt`;
        }
        const existing = vfs["デスクトップ"].find(f => f.name === currentFile);
        if (existing) {
          existing.content = area.value;
        } else {
          vfs["デスクトップ"].push({ name: currentFile, type: "file", content: area.value });
        }
        saveVFS();
        body.querySelector(".np-fname").textContent = currentFile;
        winObj.el.querySelector(".win-title-text").textContent = `${currentFile} - メモ帳`;
        pushNotification("メモ帳", `デスクトップに「${currentFile}」を保存しました。`);
      });
    }

    else if (appId === "calc") {
      let expr = "";
      let current = "0";
      body.innerHTML = `
        <div class="calc-wrap">
          <div style="font-size:13px;font-weight:600;">標準</div>
          <div class="calc-display">
            <div class="calc-expr"></div>
            <div class="calc-val">0</div>
          </div>
          <div class="calc-grid">
            ${["%", "CE", "C", "⌫", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "±", "0", ".", "+"].map(k =>
              `<button class="calc-btn" data-k="${k}">${k}</button>`
            ).join("")}
            <button class="calc-btn eq" style="grid-column:span 4;" data-k="=">=</button>
          </div>
        </div>
      `;
      const exprEl = body.querySelector(".calc-expr");
      const valEl = body.querySelector(".calc-val");

      function updateCalc() {
        exprEl.textContent = expr;
        valEl.textContent = current;
      }

      body.querySelectorAll(".calc-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const k = btn.dataset.k;
          if (/^[0-9]$/.test(k)) {
            current = current === "0" ? k : current + k;
          } else if (k === ".") {
            if (!current.includes(".")) current += ".";
          } else if (k === "C" || k === "CE") {
            expr = "";
            current = "0";
          } else if (k === "⌫") {
            current = current.length > 1 ? current.slice(0, -1) : "0";
          } else if (k === "±") {
            current = String(Number(current) * -1);
          } else if (k === "%") {
            current = String(Number(current) / 100);
          } else if (["+", "-", "×", "÷"].includes(k)) {
            expr = `${current} ${k}`;
            current = "0";
          } else if (k === "=" && expr) {
            const parts = expr.split(" ");
            const a = Number(parts[0]);
            const op = parts[1];
            const b = Number(current);
            let res = 0;
            if (op === "+") res = a + b;
            if (op === "-") res = a - b;
            if (op === "×") res = a * b;
            if (op === "÷") res = b !== 0 ? a / b : "0 で割ることはできません";
            expr = `${a} ${op} ${b} =`;
            current = String(res);
          }
          updateCalc();
        });
      });
    }

    else if (appId === "settings") {
      body.innerHTML = `
        <div class="settings-wrap">
          <div class="settings-nav">
            <div class="set-nav-item active" data-tab="system">💻 システム</div>
            <div class="set-nav-item" data-tab="personal">🎨 個人用設定</div>
            <div class="set-nav-item" data-tab="lang">🌐 時刻と言語</div>
            <div class="set-nav-item" data-tab="about">ℹ️ バージョン情報</div>
          </div>
          <div class="settings-main"></div>
        </div>
      `;
      const main = body.querySelector(".settings-main");

      function renderTab(tab) {
        body.querySelectorAll(".set-nav-item").forEach(i => i.classList.toggle("active", i.dataset.tab === tab));
        if (tab === "system") {
          main.innerHTML = `
            <h3 style="margin-bottom:14px;">システム</h3>
            <div class="set-card"><div><strong>ディスプレイ</strong><div style="font-size:12px;color:var(--text-secondary)">解像度: ${window.innerWidth} × ${window.innerHeight} (スケーリング 100%)</div></div><span>🖥️</span></div>
            <div class="set-card"><div><strong>サウンド</strong><div style="font-size:12px;color:var(--text-secondary)">出力デバイス: スピーカー (Realtek High Definition Audio)</div></div><span>🔊</span></div>
            <div class="set-card"><div><strong>ストレージ</strong><div style="font-size:12px;color:var(--text-secondary)">仮想ディスク: 正常 (localStorage 同期中)</div></div><button class="pill-btn reset-vfs">初期状態にリセット</button></div>
          `;
          main.querySelector(".reset-vfs").addEventListener("click", () => {
            vfs = structuredClone(defaultFS);
            saveVFS();
            pushNotification("設定", "仮想ファイルシステムを初期状態に復元しました。");
          });
        } else if (tab === "personal") {
          main.innerHTML = `
            <h3 style="margin-bottom:14px;">個人用設定</h3>
            <div class="set-card" style="flex-direction:column;align-items:flex-start;">
              <strong>背景の壁紙を選択</strong>
              <div class="wallpaper-swatches">
                <div class="wp-swatch" data-wp="wallpaper-bloom" style="background:linear-gradient(135deg,#0d3b7a,#4dabff)" title="Windows ブルーム"></div>
                <div class="wp-swatch" data-wp="wallpaper-darkbloom" style="background:linear-gradient(135deg,#050811,#2962ff)" title="ダーク ブルーム"></div>
                <div class="wp-swatch" data-wp="wallpaper-sunset" style="background:linear-gradient(135deg,#6a1b4d,#ffb74d)" title="サンセット"></div>
                <div class="wp-swatch" data-wp="wallpaper-forest" style="background:linear-gradient(135deg,#071e1b,#26a69a)" title="フォレスト"></div>
              </div>
            </div>
            <div class="set-card">
              <div><strong>カラー モード</strong><div style="font-size:12px;color:var(--text-secondary)">ライト モードとダーク モードを切り替えます</div></div>
              <button class="pill-btn toggle-dark">ライト / ダーク切替</button>
            </div>
          `;
          main.querySelectorAll(".wp-swatch").forEach(sw => {
            sw.addEventListener("click", () => {
              document.body.classList.remove("wallpaper-bloom", "wallpaper-darkbloom", "wallpaper-sunset", "wallpaper-forest");
              document.body.classList.add(sw.dataset.wp);
            });
          });
          main.querySelector(".toggle-dark").addEventListener("click", () => {
            const isDark = document.body.classList.contains("theme-dark");
            document.body.classList.toggle("theme-dark", !isDark);
            document.body.classList.toggle("theme-light", isDark);
          });
        } else if (tab === "lang") {
          main.innerHTML = `
            <h3 style="margin-bottom:14px;">時刻と言語</h3>
            <div class="set-card"><div><strong>Windows の表示言語</strong><div style="font-size:12px;color:var(--text-secondary)">日本語 (日本) - ja-JP</div></div><span>🇯🇵</span></div>
            <div class="set-card"><div><strong>タイム ゾーン</strong><div style="font-size:12px;color:var(--text-secondary)">(UTC+09:00) 大阪、札幌、東京</div></div><span>🕒</span></div>
          `;
        } else if (tab === "about") {
          main.innerHTML = `
            <h3 style="margin-bottom:14px;">バージョン情報</h3>
            <div class="set-card"><div><strong>エディション</strong><div style="font-size:12px;color:var(--text-secondary)">Windows 11 Pro シミュレーター (ja-JP)</div></div><span>24H2</span></div>
            <div class="set-card"><div><strong>プロセッサ / メモリ</strong><div style="font-size:12px;color:var(--text-secondary)">Virtual Core x64 / 16.0 GB RAM</div></div><span>正常</span></div>
          `;
        }
      }

      body.querySelectorAll(".set-nav-item").forEach(nav => {
        nav.addEventListener("click", () => renderTab(nav.dataset.tab));
      });
      renderTab("system");
    }

    else if (appId === "edge") {
      body.innerHTML = `
        <div class="edge-bar">
          <button class="pill-btn edge-home">🏠</button>
          <input type="text" class="edge-url" value="https://www.msn.com/ja-jp" />
          <button class="pill-btn edge-go">移動</button>
        </div>
        <div class="edge-view"></div>
      `;
      const urlInput = body.querySelector(".edge-url");
      const view = body.querySelector(".edge-view");

      function renderPage(query) {
        if (!query || query.includes("msn.com")) {
          view.innerHTML = `
            <div style="max-width:620px;margin:10px auto;text-align:center;">
              <h2 style="margin-bottom:16px;">Microsoft Bing <span style="font-size:13px;color:var(--accent)">日本語</span></h2>
              <div style="display:flex;gap:8px;margin-bottom:24px;">
                <input type="text" class="bing-q" placeholder="Web を検索..." style="flex:1;padding:10px 16px;border-radius:999px;border:1px solid var(--border-subtle);background:var(--bg-card);color:var(--text-primary);user-select:text;" />
                <button class="pill-btn bing-btn" style="padding:0 18px;border-radius:999px;">検索</button>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:left;">
                <div class="widget-card"><strong>⛅ 東京の天気</strong><p style="font-size:12px;margin-top:6px;">晴れ 15°C 降水確率 10%</p></div>
                <div class="widget-card"><strong>📈 マーケット</strong><p style="font-size:12px;margin-top:6px;">日経平均 +1.24% / USD/JPY 148.50</p></div>
                <div class="widget-card"><strong>💡 ヒント</strong><p style="font-size:12px;margin-top:6px;">Edge のアドレスバーから検索やページ移動が可能です。</p></div>
              </div>
            </div>
          `;
          view.querySelector(".bing-btn").addEventListener("click", () => {
            const q = view.querySelector(".bing-q").value;
            urlInput.value = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
            renderPage(q);
          });
        } else {
          view.innerHTML = `
            <div style="max-width:620px;margin:10px auto;">
              <h3>「${query}」の検索結果 (シミュレーター)</h3>
              <p style="font-size:13px;color:var(--text-secondary);margin:8px 0 16px;">日本語 (ja-JP) 検索インデックスから関連トピックを表示しています。</p>
              <div class="widget-card" style="margin-bottom:10px;">
                <strong style="color:var(--accent)">${query} - 公式ドキュメントとガイド</strong>
                <p style="font-size:12px;margin-top:4px;">Windows 11 環境での「${query}」に関する詳しい設定方法と活用ガイドです。</p>
              </div>
              <div class="widget-card">
                <strong style="color:var(--accent)">${query} の最新ニュースとトレンド (2026)</strong>
                <p style="font-size:12px;margin-top:4px;">国内ユーザー向けの最新アップデート情報とコミュニティの議論まとめ。</p>
              </div>
            </div>
          `;
        }
      }

      body.querySelector(".edge-home").addEventListener("click", () => {
        urlInput.value = "https://www.msn.com/ja-jp";
        renderPage("msn.com");
      });
      body.querySelector(".edge-go").addEventListener("click", () => renderPage(urlInput.value));
      urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") renderPage(urlInput.value); });
      renderPage("msn.com");
    }

    else if (appId === "terminal") {
      body.innerHTML = `
        <div class="term-body">
          <div>Windows PowerShell (ja-JP シミュレーター)</div>
          <div>Copyright (C) Microsoft Corporation. All rights reserved.</div>
          <div style="margin-bottom:8px;">コマンド一覧を表示するには <strong>help</strong> と入力してください。</div>
          <div class="term-output"></div>
          <div class="term-input-line">
            <span style="color:#4cc2ff">PS C:\Users\User&gt;</span>
            <input type="text" class="term-input" autofocus />
          </div>
        </div>
      `;
      const out = body.querySelector(".term-output");
      const input = body.querySelector(".term-input");

      function printLine(text) {
        const div = document.createElement("div");
        div.style.whiteSpace = "pre-wrap";
        div.textContent = text;
        out.appendChild(div);
        body.querySelector(".term-body").scrollTop = 99999;
      }

      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const cmd = input.value.trim();
        printLine(`PS C:\Users\User> ${cmd}`);
        input.value = "";
        const low = cmd.toLowerCase();
        if (!cmd) return;
        if (low === "help") {
          printLine("利用可能なコマンド:
  help       - このヘルプを表示
  dir / ls   - デスクトップのファイル一覧を表示
  ver        - OS バージョン情報を表示
  date       - 現在の日時を表示
  whoami     - 現在のユーザー名を表示
  notepad    - メモ帳を起動
  calc       - 電卓を起動
  cls        - 画面をクリア");
        } else if (low === "dir" || low === "ls") {
          const list = vfs["デスクトップ"].map(f => `${f.type === "folder" ? "<DIR>" : "     "}  ${f.name}`).join("
");
          printLine(`ディレクトリ: C:\Users\User\Desktop

${list}`);
        } else if (low === "ver" || low === "systeminfo") {
          printLine("Microsoft Windows [Version 10.0.26100.24H2] (ja-JP / 日本語)");
        } else if (low === "date" || low === "time") {
          printLine(new Date().toLocaleString("ja-JP"));
        } else if (low === "whoami") {
          printLine("win11-ja\user");
        } else if (low === "notepad") {
          openApp("notepad");
          printLine("メモ帳を起動しました。");
        } else if (low === "calc") {
          openApp("calc");
          printLine("電卓を起動しました。");
        } else if (low === "cls" || low === "clear") {
          out.innerHTML = "";
        } else {
          printLine(`'${cmd}' は、内部コマンドまたは外部コマンドとして認識されていません。'help' を参照してください。`);
        }
      });
    }

    else if (appId === "paint") {
      body.innerHTML = `
        <div class="paint-toolbar">
          <label>色: <input type="color" class="paint-color" value="#0067c0" /></label>
          <label>太さ: <input type="range" class="paint-size" min="1" max="24" value="4" /></label>
          <button class="pill-btn paint-clear">すべて消去</button>
          <button class="pill-btn paint-save">PNG 保存</button>
        </div>
        <div class="paint-canvas-wrap">
          <canvas class="paint-canvas" width="560" height="340"></canvas>
        </div>
      `;
      const canvas = body.querySelector(".paint-canvas");
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let drawing = false;
      canvas.addEventListener("mousedown", (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      });
      canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;
        ctx.strokeStyle = body.querySelector(".paint-color").value;
        ctx.lineWidth = body.querySelector(".paint-size").value;
        ctx.lineCap = "round";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      });
      window.addEventListener("mouseup", () => { drawing = false; });

      body.querySelector(".paint-clear").addEventListener("click", () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      body.querySelector(".paint-save").addEventListener("click", () => {
        const a = document.createElement("a");
        a.download = "windows11_paint_ja.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      });
    }

    else if (appId === "taskmgr") {
      body.innerHTML = `
        <div style="padding:14px;">
          <h4 style="margin-bottom:10px;">実行中のプロセス (${openWindows.length} 個)</h4>
          <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <th style="padding:6px;">名前</th>
                <th style="padding:6px;">状態</th>
                <th style="padding:6px;">CPU</th>
                <th style="padding:6px;">メモリ</th>
                <th style="padding:6px;">操作</th>
              </tr>
            </thead>
            <tbody class="tm-rows"></tbody>
          </table>
        </div>
      `;
      const tbody = body.querySelector(".tm-rows");
      function renderRows() {
        tbody.innerHTML = openWindows.map(w => {
          const app = APPS.find(a => a.id === w.appId);
          return `
            <tr style="border-bottom:1px solid var(--border-subtle);">
              <td style="padding:6px;">${app.icon} ${app.name}</td>
              <td style="padding:6px;">実行中</td>
              <td style="padding:6px;">${(Math.random() * 4 + 0.5).toFixed(1)}%</td>
              <td style="padding:6px;">${Math.floor(Math.random() * 120 + 40)} MB</td>
              <td style="padding:6px;"><button class="pill-btn tm-end" data-wid="${w.id}">タスクの終了</button></td>
            </tr>
          `;
        }).join("");
        tbody.querySelectorAll(".tm-end").forEach(btn => {
          btn.addEventListener("click", () => {
            closeWindow(btn.dataset.wid);
            if (btn.dataset.wid !== winObj.id) renderRows();
          });
        });
      }
      renderRows();
    }
  }

  // キーボードショートカット
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      toggleFlyout("start-menu");
    }
    if (e.key === "F5") {
      e.preventDefault();
      renderDesktopIcons();
    }
  });
})();
