// Virtual File System & Built-in Windows 11 Applications (en-US)
const VirtualFS = {
  "Desktop": {
    "Welcome.txt": "Welcome to Windows 11 Simulator (en-US)!\n\nExplore File Explorer, Notepad, Microsoft Edge, Windows Terminal, Calculator, Settings, and Task Manager.\nRight-click anywhere on the desktop to create folders or change wallpapers."
  },
  "Documents": {
    "System_Specs_en-US.txt": "Edition: Windows 11 Pro\nVersion: 24H2\nSystem Locale: English (United States) [en-US]\nTime Zone: (UTC-05:00) Eastern Time (US & Canada)",
    "Project_Notes.txt": "Q4 Objectives:\n- Finalize Fluent UI components\n- Verify en-US localization strings\n- Test keyboard shortcuts"
  },
  "Downloads": {
    "Windows11_Guide.txt": "Quick Tips:\n1. Click the Start button or press Search to launch apps.\n2. Use Quick Settings in the bottom-right system tray to toggle Dark Mode or Night Light.\n3. Open Windows Terminal and type 'help' for supported commands."
  },
  "Pictures": {
    "Bloom_Wallpaper_Info.txt": "Windows 11 Default Bloom (en-US) - Rendered natively with multi-layer CSS gradients."
  }
};

const AppRegistry = {
  explorer: {
    id: "explorer",
    name: "File Explorer",
    pinned: true,
    desktop: true,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#f5b932"/><path d="M2 9h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" fill="#ffd56b"/><rect x="7" y="12" width="10" height="4" rx="1" fill="#0078d4"/></svg>`
  },
  edge: {
    id: "edge",
    name: "Microsoft Edge",
    pinned: true,
    desktop: true,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#0078d4"/><path d="M12 4a8 8 0 0 1 7.6 5.5H13a3 3 0 0 0-2.8 4 5 5 0 0 0 7.4 2.5A8 8 0 1 1 12 4z" fill="#38bdf8"/></svg>`
  },
  notepad: {
    id: "notepad",
    name: "Notepad",
    pinned: true,
    desktop: true,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="3" width="16" height="18" rx="2" fill="#38bdf8"/><rect x="6" y="7" width="12" height="12" rx="1" fill="#ffffff"/><line x1="8" y1="10" x2="16" y2="10" stroke="#0284c7" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="#0284c7" stroke-width="1.5"/><line x1="8" y1="16" x2="13" y2="16" stroke="#0284c7" stroke-width="1.5"/></svg>`
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    pinned: true,
    desktop: true,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="2.5" fill="#1e1e1e"/><polyline points="7 9 11 12 7 15" fill="none" stroke="#38bdf8" stroke-width="2"/><line x1="12" y1="15" x2="17" y2="15" stroke="#ffffff" stroke-width="2"/></svg>`
  },
  settings: {
    id: "settings",
    name: "Settings",
    pinned: true,
    desktop: false,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="9" fill="#475569"/><circle cx="12" cy="12" r="4" fill="#e2e8f0"/><circle cx="12" cy="12" r="2" fill="#0078d4"/></svg>`
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    pinned: true,
    desktop: false,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="2" width="16" height="20" rx="2.5" fill="#0284c7"/><rect x="7" y="5" width="10" height="4" rx="1" fill="#e0f2fe"/><circle cx="8.5" cy="12.5" r="1.2" fill="#fff"/><circle cx="12" cy="12.5" r="1.2" fill="#fff"/><circle cx="15.5" cy="12.5" r="1.2" fill="#fff"/><circle cx="8.5" cy="16.5" r="1.2" fill="#fff"/><circle cx="12" cy="16.5" r="1.2" fill="#fff"/><rect x="14.3" y="15.3" width="2.4" height="4" rx="1" fill="#38bdf8"/></svg>`
  },
  taskmgr: {
    id: "taskmgr",
    name: "Task Manager",
    pinned: false,
    desktop: false,
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#0f172a"/><polyline points="5 14 9 14 11 8 14 17 16 12 19 12" fill="none" stroke="#22c55e" stroke-width="2"/></svg>`
  }
};

const Apps = (() => {
  function open(appId, options = {}) {
    System.hideAllFlyouts();
    const meta = AppRegistry[appId];
    if (!meta) return;

    switch (appId) {
      case "explorer":
        openExplorer(options.folder || "Desktop");
        break;
      case "notepad":
        openNotepad(options.filename || "Untitled.txt", options.content || "", options.folder || "Desktop");
        break;
      case "edge":
        openEdge(options.url || "https://welcome.windows11.local");
        break;
      case "settings":
        openSettings(options.tab || "system");
        break;
      case "calculator":
        openCalculator();
        break;
      case "terminal":
        openTerminal();
        break;
      case "taskmgr":
        openTaskManager();
        break;
    }
  }

  function openExplorer(initialFolder) {
    let currentFolder = initialFolder;
    WindowManager.createWindow({
      id: "explorer",
      title: "File Explorer",
      icon: AppRegistry.explorer.icon,
      width: 780,
      height: 480,
      contentHTML: `
        <div class="explorer-toolbar">
          <button class="win-btn" id="exp-new-folder">+ New folder</button>
          <div class="explorer-path" id="exp-path">This PC > ${currentFolder}</div>
        </div>
        <div class="explorer-body">
          <div class="explorer-sidebar" id="exp-sidebar"></div>
          <div class="explorer-files" id="exp-files"></div>
        </div>
      `,
      onInit: (body) => {
        const sidebar = body.querySelector("#exp-sidebar");
        const filesGrid = body.querySelector("#exp-files");
        const pathEl = body.querySelector("#exp-path");

        function render(folder) {
          currentFolder = folder;
          pathEl.textContent = `This PC > ${folder}`;
          sidebar.innerHTML = Object.keys(VirtualFS).map(f => `
            <div class="sidebar-link ${f === folder ? "active" : ""}" data-folder="${f}">
              <span>📁</span><span>${f}</span>
            </div>
          `).join("");

          sidebar.querySelectorAll(".sidebar-link").forEach(el => {
            el.onclick = () => render(el.dataset.folder);
          });

          const entries = VirtualFS[folder] || {};
          filesGrid.innerHTML = Object.keys(entries).map(name => {
            const isDir = typeof entries[name] === "object";
            return `
              <div class="file-item" data-name="${name}" data-isdir="${isDir}">
                <div style="font-size:32px">${isDir ? "📁" : "📄"}</div>
                <span>${name}</span>
              </div>
            `;
          }).join("") || `<div style="color:var(--text-secondary);font-size:13px;">This folder is empty.</div>`;

          filesGrid.querySelectorAll(".file-item").forEach(item => {
            item.ondblclick = () => {
              const name = item.dataset.name;
              if (item.dataset.isdir === "true") {
                System.notify("File Explorer", `Opened subfolder "${name}"`);
              } else {
                openNotepad(name, entries[name], folder);
              }
            };
          });
        }

        body.querySelector("#exp-new-folder").onclick = () => {
          const name = `New Folder (${Object.keys(VirtualFS[currentFolder]).length + 1})`;
          VirtualFS[currentFolder][name] = {};
          render(currentFolder);
          if (currentFolder === "Desktop") System.renderDesktopIcons();
        };

        render(currentFolder);
      }
    });
  }

  function openNotepad(filename, content, folder) {
    WindowManager.createWindow({
      id: "notepad",
      title: `${filename} - Notepad`,
      icon: AppRegistry.notepad.icon,
      width: 660,
      height: 440,
      contentHTML: `
        <div class="notepad-menubar">
          <button class="win-btn" id="np-new">New</button>
          <button class="win-btn primary" id="np-save">Save to ${folder}</button>
          <button class="win-btn" id="np-download">Download .txt</button>
        </div>
        <textarea class="notepad-area" id="np-editor" spellcheck="false"></textarea>
        <div class="notepad-status">
          <span id="np-counts">0 characters, 0 words</span>
          <span>UTF-8 | Windows (CRLF) | en-US</span>
        </div>
      `,
      onInit: (body) => {
        const editor = body.querySelector("#np-editor");
        const counts = body.querySelector("#np-counts");
        let activeFile = filename;

        function updateCounts() {
          const val = editor.value;
          const words = val.trim() ? val.trim().split(/\s+/).length : 0;
          counts.textContent = `${val.length} characters, ${words} words`;
        }

        editor.value = content;
        updateCounts();
        editor.addEventListener("input", updateCounts);

        body.querySelector("#np-new").onclick = () => {
          activeFile = "Untitled.txt";
          editor.value = "";
          document.querySelector("#win-notepad .win-title-text").textContent = "Untitled.txt - Notepad";
          updateCounts();
        };

        body.querySelector("#np-save").onclick = () => {
          if (activeFile === "Untitled.txt") {
            activeFile = `Note_${Date.now().toString().slice(-4)}.txt`;
          }
          VirtualFS[folder][activeFile] = editor.value;
          document.querySelector("#win-notepad .win-title-text").textContent = `${activeFile} - Notepad`;
          if (folder === "Desktop") System.renderDesktopIcons();
          System.notify("Notepad", `Saved "${activeFile}" to ${folder}.`);
        };

        body.querySelector("#np-download").onclick = () => {
          const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = activeFile;
          a.click();
        };
      }
    });
  }

  function openEdge(initialUrl) {
    const pages = {
      "https://welcome.windows11.local": `
        <h1 style="font-size:26px;margin-bottom:8px;">Microsoft Edge — New Tab (en-US)</h1>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Welcome to the Windows 11 Web Simulator browser experience.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          <div class="settings-card" style="flex-direction:column;align-items:flex-start;cursor:pointer;" data-nav="https://docs.windows11.local">
            <strong>Windows 11 Shortcuts</strong>
            <span style="font-size:12px;color:var(--text-secondary);margin-top:4px;">Learn desktop & window tips</span>
          </div>
          <div class="settings-card" style="flex-direction:column;align-items:flex-start;cursor:pointer;" data-nav="https://locale.windows11.local">
            <strong>Regional Info (en-US)</strong>
            <span style="font-size:12px;color:var(--text-secondary);margin-top:4px;">United States formatting & defaults</span>
          </div>
          <div class="settings-card" style="flex-direction:column;align-items:flex-start;cursor:pointer;" data-nav="https://weather.windows11.local">
            <strong>US Weather Outlook</strong>
            <span style="font-size:12px;color:var(--text-secondary);margin-top:4px;">72°F Sunny • Local Forecast</span>
          </div>
        </div>
      `,
      "https://docs.windows11.local": `
        <h2>Windows 11 Simulator Guide (en-US)</h2>
        <ul style="margin:12px 0 0 20px;line-height:1.8;font-size:14px;">
          <li><strong>Drag & Resize:</strong> Grab any window title bar to move it, or double-click to maximize.</li>
          <li><strong>Virtual File System:</strong> Files created in Notepad or File Explorer persist during your session.</li>
          <li><strong>Theme & Night Light:</strong> Open Quick Settings from the bottom-right system tray to toggle Dark Mode.</li>
        </ul>
      `,
      "https://locale.windows11.local": `
        <h2>Language & Region: English (United States)</h2>
        <p style="margin-top:10px;line-height:1.6;font-size:14px;">
          <strong>Locale Code:</strong> en-US<br/>
          <strong>Date Format:</strong> MM/DD/YYYY<br/>
          <strong>Time Format:</strong> 12-hour clock (AM/PM)<br/>
          <strong>Currency & Measurement:</strong> USD ($) / Imperial (°F)
        </p>
      `,
      "https://weather.windows11.local": `
        <h2>Local Forecast (United States)</h2>
        <div style="font-size:42px;font-weight:600;margin:12px 0;">72°F ☀</div>
        <p style="color:var(--text-secondary);">Clear skies throughout the afternoon. High 75°F, Low 54°F. Wind 6 mph W.</p>
      `
    };

    WindowManager.createWindow({
      id: "edge",
      title: "Microsoft Edge",
      icon: AppRegistry.edge.icon,
      width: 820,
      height: 520,
      contentHTML: `
        <div class="edge-bar">
          <button class="win-btn" id="edge-home">Home</button>
          <input class="edge-url" id="edge-url" value="${initialUrl}" />
          <button class="win-btn primary" id="edge-go">Go</button>
        </div>
        <div class="edge-viewport" id="edge-view"></div>
      `,
      onInit: (body) => {
        const urlInput = body.querySelector("#edge-url");
        const view = body.querySelector("#edge-view");

        function navigate(url) {
          urlInput.value = url;
          if (pages[url]) {
            view.innerHTML = pages[url];
            view.querySelectorAll("[data-nav]").forEach(card => {
              card.onclick = () => navigate(card.dataset.nav);
            });
          } else {
            view.innerHTML = `
              <h2>Search Results for "${url}"</h2>
              <p style="color:var(--text-secondary);margin-top:8px;">Simulated offline Edge browser (en-US). Click <strong>Home</strong> to return to quick links.</p>
            `;
          }
        }

        body.querySelector("#edge-go").onclick = () => navigate(urlInput.value.trim());
        body.querySelector("#edge-home").onclick = () => navigate("https://welcome.windows11.local");
        urlInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") navigate(urlInput.value.trim());
        });

        navigate(initialUrl);
      }
    });
  }

  function openSettings(initialTab) {
    WindowManager.createWindow({
      id: "settings",
      title: "Settings",
      icon: AppRegistry.settings.icon,
      width: 780,
      height: 500,
      contentHTML: `
        <div class="settings-layout">
          <div class="settings-nav">
            <div class="sidebar-link active" data-tab="system">💻 System</div>
            <div class="sidebar-link" data-tab="personalization">🎨 Personalization</div>
            <div class="sidebar-link" data-tab="time">🌐 Time & language</div>
            <div class="sidebar-link" data-tab="about">ℹ️ About</div>
          </div>
          <div class="settings-main" id="settings-main"></div>
        </div>
      `,
      onInit: (body) => {
        const main = body.querySelector("#settings-main");
        const navs = body.querySelectorAll(".sidebar-link");

        function renderTab(tab) {
          navs.forEach(n => n.classList.toggle("active", n.dataset.tab === tab));
          if (tab === "system") {
            main.innerHTML = `
              <h2 style="margin-bottom:16px;">System</h2>
              <div class="settings-card">
                <div><strong>Night light</strong><div style="font-size:12px;color:var(--text-secondary)">Use warmer colors to help block blue light</div></div>
                <button class="win-btn" onclick="System.toggleNightLight()">Toggle</button>
              </div>
              <div class="settings-card">
                <div><strong>Notifications</strong><div style="font-size:12px;color:var(--text-secondary)">Send a test Windows 11 toast notification</div></div>
                <button class="win-btn primary" onclick="System.notify('System Settings', 'Notifications are working properly.')">Test</button>
              </div>
            `;
          } else if (tab === "personalization") {
            main.innerHTML = `
              <h2 style="margin-bottom:16px;">Personalization</h2>
              <div class="settings-card">
                <div><strong>App & System Mode</strong><div style="font-size:12px;color:var(--text-secondary)">Switch between Light and Dark Fluent themes</div></div>
                <button class="win-btn primary" onclick="System.toggleTheme()">Switch Theme</button>
              </div>
              <div class="settings-card">
                <div><strong>Desktop Background</strong><div style="font-size:12px;color:var(--text-secondary)">Choose a built-in Windows 11 wallpaper</div></div>
                <div style="display:flex;gap:8px;">
                  <button class="win-btn" onclick="System.setWallpaper('wallpaper-bloom')">Bloom</button>
                  <button class="win-btn" onclick="System.setWallpaper('wallpaper-sunset')">Sunset</button>
                  <button class="win-btn" onclick="System.setWallpaper('wallpaper-emerald')">Emerald</button>
                </div>
              </div>
            `;
          } else if (tab === "time") {
            main.innerHTML = `
              <h2 style="margin-bottom:16px;">Time & language</h2>
              <div class="settings-card">
                <div><strong>Windows display language</strong><div style="font-size:12px;color:var(--text-secondary)">English (United States) — en-US</div></div>
                <span class="pill-badge">Active</span>
              </div>
              <div class="settings-card">
                <div><strong>Country or region</strong><div style="font-size:12px;color:var(--text-secondary)">United States</div></div>
                <span class="pill-badge">US</span>
              </div>
            `;
          } else {
            main.innerHTML = `
              <h2 style="margin-bottom:16px;">About</h2>
              <div class="settings-card" style="flex-direction:column;align-items:flex-start;gap:8px;font-size:13px;">
                <div><strong>Device name:</strong> DESKTOP-WIN11SIM</div>
                <div><strong>Edition:</strong> Windows 11 Pro (Web Simulator)</div>
                <div><strong>Version:</strong> 24H2</div>
                <div><strong>System Locale:</strong> English (United States) [en-US]</div>
              </div>
            `;
          }
        }

        navs.forEach(n => { n.onclick = () => renderTab(n.dataset.tab); });
        renderTab(initialTab);
      }
    });
  }

  function openCalculator() {
    WindowManager.createWindow({
      id: "calculator",
      title: "Calculator",
      icon: AppRegistry.calculator.icon,
      width: 340,
      height: 460,
      contentHTML: `
        <div class="calc-wrap">
          <div class="calc-display">
            <div class="calc-expr" id="calc-expr"></div>
            <div class="calc-val" id="calc-val">0</div>
          </div>
          <div class="calc-keys" id="calc-keys">
            ${["C","CE","⌫","/","7","8","9","*","4","5","6","-","1","2","3","+","±","0",".","="]
              .map(k => `<button class="calc-key ${k === "=" ? "accent" : ""}" data-k="${k}">${k}</button>`).join("")}
          </div>
        </div>
      `,
      onInit: (body) => {
        let current = "0", prev = null, op = null, resetNext = false;
        const valEl = body.querySelector("#calc-val");
        const exprEl = body.querySelector("#calc-expr");

        function update() {
          valEl.textContent = current;
          exprEl.textContent = prev !== null && op ? `${prev} ${op}` : "";
        }

        function compute(a, b, operator) {
          const x = parseFloat(a), y = parseFloat(b);
          if (operator === "+") return x + y;
          if (operator === "-") return x - y;
          if (operator === "*") return x * y;
          if (operator === "/") return y === 0 ? "Cannot divide by 0" : x / y;
          return y;
        }

        body.querySelectorAll(".calc-key").forEach(btn => {
          btn.onclick = () => {
            const k = btn.dataset.k;
            if (/^[0-9]$/.test(k)) {
              if (current === "0" || resetNext) { current = k; resetNext = false; }
              else current += k;
            } else if (k === ".") {
              if (resetNext) { current = "0."; resetNext = false; }
              else if (!current.includes(".")) current += ".";
            } else if (k === "C") {
              current = "0"; prev = null; op = null;
            } else if (k === "CE") {
              current = "0";
            } else if (k === "⌫") {
              current = current.length > 1 ? current.slice(0, -1) : "0";
            } else if (k === "±") {
              if (current !== "0") current = current.startsWith("-") ? current.slice(1) : "-" + current;
            } else if (["+","-","*","/"].includes(k)) {
              if (prev !== null && op && !resetNext) {
                current = String(compute(prev, current, op));
              }
              prev = current;
              op = k;
              resetNext = true;
            } else if (k === "=") {
              if (prev !== null && op) {
                current = String(compute(prev, current, op));
                prev = null; op = null; resetNext = true;
              }
            }
            update();
          };
        });
      }
    });
  }

  function openTerminal() {
    let cwd = "Desktop";
    WindowManager.createWindow({
      id: "terminal",
      title: "Windows PowerShell (en-US)",
      icon: AppRegistry.terminal.icon,
      width: 720,
      height: 440,
      contentHTML: `
        <div class="terminal-wrap" id="term-wrap">
          <div class="term-line">Windows PowerShell [Version 10.0.26100.1] (en-US)</div>
          <div class="term-line">(c) Microsoft Corporation. All rights reserved. Type 'help' for available commands.\n</div>
          <div id="term-out"></div>
          <div class="term-input-row">
            <span id="term-prompt">PS C:\\Users\\User\\Desktop&gt;</span>
            <input class="term-input" id="term-input" autocomplete="off" spellcheck="false" />
          </div>
        </div>
      `,
      onInit: (body) => {
        const out = body.querySelector("#term-out");
        const input = body.querySelector("#term-input");
        const promptEl = body.querySelector("#term-prompt");

        function print(text) {
          const line = document.createElement("div");
          line.className = "term-line";
          line.textContent = text;
          out.appendChild(line);
          body.querySelector("#term-wrap").scrollTop = 99999;
        }

        input.focus();
        body.querySelector("#term-wrap").onclick = () => input.focus();

        input.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          const raw = input.value.trim();
          print(`${promptEl.textContent} ${raw}`);
          input.value = "";
          if (!raw) return;

          const [cmd, ...args] = raw.split(" ");
          const c = cmd.toLowerCase();

          if (c === "help") {
            print("Supported commands: help, dir, ls, cd <folder>, cat <file>, type <file>, mkdir <name>, echo <text>, ver, systeminfo, date, cls");
          } else if (c === "cls" || c === "clear") {
            out.innerHTML = "";
          } else if (c === "ver") {
            print("Microsoft Windows [Version 10.0.26100.2033] (en-US)");
          } else if (c === "date") {
            print(new Date().toLocaleString("en-US"));
          } else if (c === "echo") {
            print(args.join(" "));
          } else if (c === "dir" || c === "ls") {
            const items = Object.keys(VirtualFS[cwd] || {});
            print(items.length ? items.join("\n") : "(empty directory)");
          } else if (c === "cd") {
            const target = args[0];
            if (!target) { print(cwd); return; }
            const match = Object.keys(VirtualFS).find(k => k.toLowerCase() === target.toLowerCase());
            if (match) {
              cwd = match;
              promptEl.textContent = `PS C:\\Users\\User\\${cwd}>`;
            } else {
              print(`cd : Cannot find path '${target}'. Available: ${Object.keys(VirtualFS).join(", ")}`);
            }
          } else if (c === "mkdir") {
            const name = args.join(" ");
            if (name) {
              VirtualFS[cwd][name] = {};
              if (cwd === "Desktop") System.renderDesktopIcons();
              print(`Directory '${name}' created.`);
            }
          } else if (c === "cat" || c === "type") {
            const file = args.join(" ");
            const entry = VirtualFS[cwd][file];
            if (typeof entry === "string") print(entry);
            else print(`Cannot read file '${file}'.`);
          } else if (c === "systeminfo") {
            print("OS Name: Microsoft Windows 11 Pro\nOS Version: 10.0.26100 N/A Build 26100\nSystem Locale: en-US;English (United States)");
          } else {
            print(`'${cmd}' is not recognized as an internal or external command. Type 'help'.`);
          }
        });
      }
    });
  }

  function openTaskManager() {
    WindowManager.createWindow({
      id: "taskmgr",
      title: "Task Manager",
      icon: AppRegistry.taskmgr.icon,
      width: 580,
      height: 420,
      contentHTML: `
        <div style="padding:16px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3>Active Processes (en-US)</h3>
            <span id="tm-stats" class="pill-badge">CPU: 14% • Memory: 38%</span>
          </div>
          <div id="tm-list" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      `,
      onInit: (body) => {
        const listEl = body.querySelector("#tm-list");
        const statsEl = body.querySelector("#tm-stats");

        function refresh() {
          if (!document.getElementById("win-taskmgr")) return;
          const wins = WindowManager.getOpenWindows();
          const cpu = Math.min(92, 8 + wins.length * 6 + Math.floor(Math.random() * 7));
          const mem = Math.min(90, 28 + wins.length * 5);
          statsEl.textContent = `CPU: ${cpu}% • Memory: ${mem}%`;

          listEl.innerHTML = wins.map(w => `
            <div class="settings-card" style="margin:0;padding:10px 14px;">
              <div><strong>${w.title}</strong> <span style="font-size:11px;color:var(--text-secondary)">(${w.minimized ? "Background" : "Running"})</span></div>
              ${w.id !== "taskmgr" ? `<button class="win-btn" onclick="WindowManager.closeWindow('${w.id}')">End task</button>` : `<span class="pill-badge">System</span>`}
            </div>
          `).join("");
        }

        refresh();
        const timer = setInterval(() => {
          if (!document.getElementById("win-taskmgr")) clearInterval(timer);
          else refresh();
        }, 1500);
      }
    });
  }

  return { open };
})();
