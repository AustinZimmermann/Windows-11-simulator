// Core Windows 11 Desktop & Taskbar Controller (en-US)
const System = (() => {
  let activeAppId = null;
  const wallpapers = ["wallpaper-bloom", "wallpaper-sunset", "wallpaper-emerald"];
  let wallpaperIdx = 0;

  function init() {
    updateClocks();
    setInterval(updateClocks, 1000);
    renderDesktopIcons();
    renderTaskbarPinned();
    renderStartMenu();
    renderCalendar();
    bindGlobalEvents();
  }

  function updateClocks() {
    const now = new Date();
    const time12 = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const lockTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M/, "");
    const shortDate = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const longDate = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const fullDate = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    document.getElementById("tb-time").textContent = time12;
    document.getElementById("tb-date").textContent = shortDate;
    document.getElementById("lock-time").textContent = lockTime;
    document.getElementById("lock-date").textContent = longDate;
    document.getElementById("cal-full-date").textContent = fullDate;
  }

  function unlock() {
    document.getElementById("lock-screen").classList.add("unlocked");
  }

  function lock() {
    hideAllFlyouts();
    document.getElementById("lock-screen").classList.remove("unlocked");
  }

  function renderDesktopIcons() {
    const grid = document.getElementById("desktop-icons");
    const appIcons = Object.values(AppRegistry).filter(a => a.desktop).map(app => `
      <div class="desktop-icon" ondblclick="Apps.open('${app.id}')">
        ${app.icon}
        <span>${app.name}</span>
      </div>
    `);

    const fsEntries = Object.entries(VirtualFS["Desktop"] || {}).map(([name, val]) => {
      const isDir = typeof val === "object";
      const icon = isDir
        ? `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#f5b932"/></svg>`
        : `<svg viewBox="0 0 24 24" width="28" height="28"><rect x="4" y="2" width="16" height="20" rx="2" fill="#f8fafc"/><line x1="8" y1="8" x2="16" y2="8" stroke="#64748b" stroke-width="1.5"/><line x1="8" y1="12" x2="16" y2="12" stroke="#64748b" stroke-width="1.5"/></svg>`;
      const action = isDir
        ? `Apps.open('explorer', {folder: 'Desktop'})`
        : `Apps.open('notepad', {filename: '${name.replace(/'/g, "\\'")}', content: VirtualFS['Desktop']['${name.replace(/'/g, "\\'")}'], folder: 'Desktop'})`;
      return `
        <div class="desktop-icon" ondblclick="${action}">
          ${icon}
          <span>${name}</span>
        </div>
      `;
    });

    grid.innerHTML = [...appIcons, ...fsEntries].join("");
  }

  function renderTaskbarPinned() {
    const container = document.getElementById("taskbar-pinned-list");
    const openIds = new Set(WindowManager.getOpenWindows().map(w => w.id));
    const shownApps = Object.values(AppRegistry).filter(a => a.pinned || openIds.has(a.id));

    container.innerHTML = shownApps.map(app => `
      <button class="tb-icon-btn ${openIds.has(app.id) ? "running" : ""} ${activeAppId === app.id ? "active" : ""}"
              title="${app.name}"
              onclick="System.handleTaskbarAppClick('${app.id}')">
        ${app.icon}
      </button>
    `).join("");
  }

  function handleTaskbarAppClick(appId) {
    hideAllFlyouts();
    if (!WindowManager.toggleWindow(appId)) {
      Apps.open(appId);
    }
  }

  function updateTaskbarStates() {
    renderTaskbarPinned();
  }

  function setActiveApp(appId) {
    activeAppId = appId;
    renderTaskbarPinned();
  }

  function renderStartMenu(filter = "") {
    const grid = document.getElementById("start-pinned-grid");
    const recList = document.getElementById("start-recommended-list");
    const q = filter.trim().toLowerCase();

    const apps = Object.values(AppRegistry).filter(a => a.name.toLowerCase().includes(q));
    grid.innerHTML = apps.map(app => `
      <div class="start-app-item" onclick="Apps.open('${app.id}')">
        ${app.icon}
        <span>${app.name}</span>
      </div>
    `).join("");

    recList.innerHTML = `
      <div class="rec-item" onclick="Apps.open('notepad', {filename: 'Welcome.txt', content: VirtualFS['Desktop']['Welcome.txt'], folder: 'Desktop'})">
        <span style="font-size:20px;">📄</span>
        <div class="rec-meta">
          <span class="rec-title">Welcome.txt</span>
          <span class="rec-sub">Desktop • Recently added</span>
        </div>
      </div>
      <div class="rec-item" onclick="Apps.open('notepad', {filename: 'System_Specs_en-US.txt', content: VirtualFS['Documents']['System_Specs_en-US.txt'], folder: 'Documents'})">
        <span style="font-size:20px;">📄</span>
        <div class="rec-meta">
          <span class="rec-title">System_Specs_en-US.txt</span>
          <span class="rec-sub">Documents • en-US</span>
        </div>
      </div>
    `;
  }

  function filterStartApps(val) {
    renderStartMenu(val);
  }

  function toggleFlyout(id) {
    const el = document.getElementById(id);
    const wasHidden = el.classList.contains("hidden");
    hideAllFlyouts();
    if (wasHidden) {
      el.classList.remove("hidden");
      if (id === "start-menu") {
        const inp = document.getElementById("start-search-input");
        inp.value = "";
        renderStartMenu("");
        setTimeout(() => inp.focus(), 50);
      }
    }
  }

  function hideAllFlyouts() {
    ["start-menu", "quick-settings", "calendar-flyout", "context-menu"].forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });
  }

  function toggleQuickTile(key) {
    document.getElementById(`qs-${key}`).classList.toggle("active");
  }

  function toggleNightLight() {
    const overlay = document.getElementById("night-light-overlay");
    const active = overlay.classList.toggle("active");
    document.getElementById("qs-night").classList.toggle("active", active);
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    html.setAttribute("data-theme", next);
    document.getElementById("qs-theme").classList.toggle("active", next === "dark");
    document.getElementById("qs-theme-label").textContent = next === "dark" ? "Dark mode" : "Light mode";
  }

  function setBrightness(val) {
    const opacity = (100 - parseInt(val, 10)) / 120;
    document.getElementById("brightness-overlay").style.opacity = opacity.toFixed(2);
  }

  function setWallpaper(cls) {
    const desk = document.getElementById("desktop");
    wallpapers.forEach(w => desk.classList.remove(w));
    desk.classList.add(cls);
  }

  function cycleWallpaper() {
    wallpaperIdx = (wallpaperIdx + 1) % wallpapers.length;
    setWallpaper(wallpapers[wallpaperIdx]);
    hideAllFlyouts();
  }

  function createDesktopFolder() {
    const name = `New Folder (${Object.keys(VirtualFS["Desktop"]).length + 1})`;
    VirtualFS["Desktop"][name] = {};
    renderDesktopIcons();
    hideAllFlyouts();
  }

  function refreshDesktop() {
    hideAllFlyouts();
    const icons = document.getElementById("desktop-icons");
    icons.style.opacity = "0.2";
    setTimeout(() => { icons.style.opacity = "1"; }, 120);
  }

  function renderCalendar() {
    const grid = document.getElementById("cal-grid");
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
      .map(d => `<div class="cal-day-name">${d}</div>`).join("");
    const blanks = Array(firstDay).fill(`<div></div>`).join("");
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `<div class="cal-day ${d === today ? "today" : ""}">${d}</div>`;
    }).join("");

    grid.innerHTML = dayHeaders + blanks + days;
  }

  function notify(title, body) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast-card";
    toast.innerHTML = `<div class="notif-title">${title}</div><div class="notif-body">${body}</div>`;
    container.appendChild(toast);

    const list = document.getElementById("notif-list");
    const card = document.createElement("div");
    card.className = "notif-card";
    card.innerHTML = `<div class="notif-title">${title}</div><div class="notif-body">${body}</div>`;
    list.prepend(card);

    setTimeout(() => toast.remove(), 4000);
  }

  function clearNotifications() {
    document.getElementById("notif-list").innerHTML = `<div style="font-size:12px;color:var(--text-secondary);">No new notifications</div>`;
  }

  function bindGlobalEvents() {
    const desktop = document.getElementById("desktop");
    desktop.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".win-window") || e.target.closest(".taskbar")) return;
      e.preventDefault();
      hideAllFlyouts();
      const menu = document.getElementById("context-menu");
      menu.style.left = `${Math.min(window.innerWidth - 230, e.clientX)}px`;
      menu.style.top = `${Math.min(window.innerHeight - 220, e.clientY)}px`;
      menu.classList.remove("hidden");
    });

    document.addEventListener("mousedown", (e) => {
      if (!e.target.closest(".start-menu") &&
          !e.target.closest(".quick-settings") &&
          !e.target.closest(".calendar-flyout") &&
          !e.target.closest(".context-menu") &&
          !e.target.closest(".taskbar")) {
        hideAllFlyouts();
      }
    });
  }

  window.addEventListener("DOMContentLoaded", init);

  return {
    unlock,
    lock,
    renderDesktopIcons,
    updateTaskbarStates,
    setActiveApp,
    handleTaskbarAppClick,
    filterStartApps,
    toggleFlyout,
    hideAllFlyouts,
    toggleQuickTile,
    toggleNightLight,
    toggleTheme,
    setBrightness,
    setWallpaper,
    cycleWallpaper,
    createDesktopFolder,
    refreshDesktop,
    notify,
    clearNotifications
  };
})();
