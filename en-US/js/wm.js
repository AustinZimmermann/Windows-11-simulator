// Window Manager for Windows 11 Simulator (en-US)
const WindowManager = (() => {
  let zIndexCounter = 100;
  const windows = new Map();

  function createWindow({ id, title, icon, width = 760, height = 500, contentHTML, onInit }) {
    if (windows.has(id)) {
      const existing = windows.get(id);
      if (existing.minimized) restoreWindow(id);
      focusWindow(id);
      return existing.el;
    }

    const container = document.getElementById("windows-container");
    const offset = (windows.size % 6) * 28;
    const left = Math.max(40, Math.min(window.innerWidth - width - 40, 120 + offset));
    const top = Math.max(24, Math.min(window.innerHeight - height - 80, 48 + offset));

    const winEl = document.createElement("div");
    winEl.className = "win-window";
    winEl.id = `win-${id}`;
    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    winEl.style.left = `${left}px`;
    winEl.style.top = `${top}px`;
    winEl.style.zIndex = ++zIndexCounter;

    winEl.innerHTML = `
      <div class="win-titlebar" data-win-id="${id}">
        <div class="win-title-left">
          <span class="win-icon">${icon}</span>
          <span class="win-title-text">${title}</span>
        </div>
        <div class="win-controls">
          <button class="win-ctrl-btn" title="Minimize" onclick="WindowManager.minimizeWindow('${id}')">&#8211;</button>
          <button class="win-ctrl-btn" title="Maximize" onclick="WindowManager.toggleMaximize('${id}')">&#9633;</button>
          <button class="win-ctrl-btn close" title="Close" onclick="WindowManager.closeWindow('${id}')">&#10005;</button>
        </div>
      </div>
      <div class="win-content" id="win-body-${id}">${contentHTML}</div>
      <div class="win-resize-handle" data-resize-id="${id}"></div>
    `;

    winEl.addEventListener("mousedown", () => focusWindow(id));
    setupDrag(winEl.querySelector(".win-titlebar"), winEl, id);
    setupResize(winEl.querySelector(".win-resize-handle"), winEl);

    container.appendChild(winEl);
    windows.set(id, { id, title, el: winEl, minimized: false, maximized: false });

    focusWindow(id);
    System.updateTaskbarStates();
    if (typeof onInit === "function") onInit(winEl.querySelector(`#win-body-${id}`));
    return winEl;
  }

  function focusWindow(id) {
    const win = windows.get(id);
    if (!win) return;
    win.el.style.zIndex = ++zIndexCounter;
    System.setActiveApp(id);
  }

  function minimizeWindow(id) {
    const win = windows.get(id);
    if (!win) return;
    win.minimized = true;
    win.el.classList.add("minimized");
    System.setActiveApp(null);
    System.updateTaskbarStates();
  }

  function restoreWindow(id) {
    const win = windows.get(id);
    if (!win) return;
    win.minimized = false;
    win.el.classList.remove("minimized");
    focusWindow(id);
    System.updateTaskbarStates();
  }

  function toggleWindow(id) {
    const win = windows.get(id);
    if (!win) return false;
    if (win.minimized) {
      restoreWindow(id);
    } else if (parseInt(win.el.style.zIndex, 10) === zIndexCounter) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
    return true;
  }

  function toggleMaximize(id) {
    const win = windows.get(id);
    if (!win) return;
    win.maximized = !win.maximized;
    win.el.classList.toggle("maximized", win.maximized);
  }

  function closeWindow(id) {
    const win = windows.get(id);
    if (!win) return;
    win.el.remove();
    windows.delete(id);
    System.setActiveApp(null);
    System.updateTaskbarStates();
  }

  function minimizeAll() {
    windows.forEach((w) => {
      w.minimized = true;
      w.el.classList.add("minimized");
    });
    System.setActiveApp(null);
    System.updateTaskbarStates();
  }

  function setupDrag(handle, winEl, id) {
    let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win-controls")) return;
      const state = windows.get(id);
      if (state && state.maximized) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = winEl.offsetLeft;
      origY = winEl.offsetTop;
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      winEl.style.left = `${origX + (e.clientX - startX)}px`;
      winEl.style.top = `${Math.max(0, origY + (e.clientY - startY))}px`;
    });
    window.addEventListener("mouseup", () => { dragging = false; });
    handle.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".win-controls")) toggleMaximize(id);
    });
  }

  function setupResize(handle, winEl) {
    let resizing = false, startX = 0, startY = 0, origW = 0, origH = 0;
    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      origW = winEl.offsetWidth;
      origH = winEl.offsetHeight;
    });
    window.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      winEl.style.width = `${Math.max(320, origW + (e.clientX - startX))}px`;
      winEl.style.height = `${Math.max(220, origH + (e.clientY - startY))}px`;
    });
    window.addEventListener("mouseup", () => { resizing = false; });
  }

  return {
    createWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    toggleWindow,
    toggleMaximize,
    closeWindow,
    minimizeAll,
    getOpenWindows: () => Array.from(windows.values())
  };
})();
