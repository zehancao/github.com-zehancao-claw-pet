const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let win = null;
let tray = null;

function createWindow() {
  const displays = require('electron').screen.getPrimaryDisplay();
  const { width: sw, height: sh } = displays.workAreaSize;

  win = new BrowserWindow({
    width: 134,
    height: 130,
    x: sw - 154,
    y: sh - 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    type: 'toolbar',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'floating');

  win.on('blur', () => {});

  // Close → hide to tray instead of quit
  win.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  win.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// ── Create Tray ──────────────────────────────────────

function createTray() {
  // Embedded white lobster icon (base64 PNG)
  const iconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABK2lDQ1BTa2lhAAAokX2QMUvDUBSFv1cKomYRFR0cMnbRppWmDdahqbXo2Cqk3dI0FLFNQxrRvas/wtlNcBGhs4uT4CTi4i4IrpXXDClIPNPHuQfuPRdSmwBpDQZeGDTqpmq12urCBwLBTLYz8kmWgJ/XKPuy/U8uSYtdd+QAX0AYWK02iC6w1ov4SnIn4mvJl6EfgriRHJw0qiDugUxvjjtz7PiBzL8B5UH/wonvRnG90yZgAVvUGTKkRx+XLE3OOcMmi0YNgxK71KhQoUCFHHlKGOgU0KhiUqRKkUN0SuTJcTBjA13+M1o5fof9yXQ6fYy94wnc6bD0EHuZPVhR4Ok59uIf+3Zgz6w0kHJN+F4H5RZWP2F5DGzIcUJX9U9XlSM8HHZQyaORQ/8FDJRN2vTWQQEAAAGESURBVDiNhZOxTtRBEIe/+XOeRkoKDSRGC6I1RI2Nb6AGrcSS0AiBhuZ8BWx4BvUptD69qFQaSaDAGENFjIDJCdHPwtlkudzpJJOdnZnf7OzOb6ESdVJ9wAhR76uTtS8y0ETEb3UeeAq8AY6B65n3FmgDt4C1iHhRMHX1sVyf+Vd66pK6nLbq83LgYGtNruvqZ/XqkPavZWz9VBG1UUO9ofbzHWbV2+mPtGcz1s/cUBvUM1nopfpEbavf1X11InU/fW21o75KTKt0cUXdSXtKPUq9mFr2U5mzo14u4E4Gf6pL6VtUF6r7L6iLaT/O3CO1E+ousAlcAs4BNyPixwgejAM9oA98AWZawFfgNTABfANOykgj4lc9YuAE2EtOdIELqB/Vbs55ZQAwjCermdtVP6DeVQ/Ud2Vs/6ByGev7nMqdEphWP6nnR4Hrd1C31GmARm1FxDZwCDz63xWAh8BBRGyrrZrGc0nV9rBrZOtn1V31HgN0Lr+yp24w8GGqQzbUXo35A5Xo0rJwuGjFAAAAAElFTkSuQmCC';
  const iconImg = nativeImage.createFromDataURL(iconData);
  tray = new Tray(iconImg);
  tray.setToolTip('Claw Pet');

  const trayMenu = Menu.buildFromTemplate([
    { label: '显示 / 隐藏', click: toggleWindow },
    { type: 'separator' },
    { label: '重启 Claw', click: () => { app.relaunch(); app.exit(0); } },
    { label: '退出', click: () => { app.isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(trayMenu);
  tray.on('click', toggleWindow);
}

function toggleWindow() {
  if (!win) return;
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

// ── Screen Time Effect ─────────────────────────────

let timeEffectWin = null;

function showScreenTime(timeText) {
  if (timeEffectWin && !timeEffectWin.isDestroyed()) {
    timeEffectWin.close();
  }

  const displays = require('electron').screen.getPrimaryDisplay();
  const { width: sw, height: sh } = displays.size;

  const colors = ['#FF6B6B', '#FFB347', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C94'];
  const count = 12 + Math.floor(Math.random() * 8);

  const bubbles = Array.from({ length: count }, (_, i) => {
    const x = 30 + Math.random() * (sw - 120);
    const y = 40 + Math.random() * (sh - 140);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 28 + Math.random() * 16;
    const sway = (Math.random() - 0.5) * 100;
    const delay = Math.random() * 0.8;
    const duration = 2.5 + Math.random() * 1.0;

    const finalSize = 44 + Math.random() * 24;
    const endX = x + (Math.random() - 0.5) * 80;
    const endY = y - 60 - Math.random() * 80;

    return '<div class="bubble" style="' +
        'position:fixed;' +
        'left:' + x + 'px;' +
        'top:' + y + 'px;' +
        'font-size:' + size + 'px;' +
        'font-weight:800;' +
        'color:' + color + ';' +
        'text-shadow:0 2px 12px rgba(0,0,0,0.3);' +
        'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
        'opacity:0;' +
        'animation:popSway ' + duration + 's ease-out ' + delay + 's forwards;' +
        '--sway:' + sway + 'px;' +
        '--fs:' + finalSize + 'px;' +
        '--ex:' + endX + 'px;' +
        '--ey:' + endY + 'px;' +
        '">' + timeText + '</div>';
  }).join('\n');

  const html = '<!DOCTYPE html>\n<html><head>\n<style>\n' +
    'body{margin:0;overflow:hidden;background:transparent;}\n' +
    '@keyframes popSway {\n' +
    '  0%   { opacity:0; transform:translate(0,0) scale(0.4); }\n' +
    '  15%  { opacity:1; transform:translate(0,0) scale(1.1); }\n' +
    '  25%  { opacity:1; transform:translate(0,0) scale(1); }\n' +
    '  70%  { opacity:0.8; transform:translate(var(--sway),-30px) scale(1.2); font-size:var(--fs); }\n' +
    '  100% { opacity:0; transform:translate(calc(var(--sway) * -0.3),-70px) scale(1); }\n' +
    '}\n</style></head><body>\n' + bubbles + '\n</body></html>';

  timeEffectWin = new BrowserWindow({
    width: sw,
    height: sh,
    x: 0, y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    type: 'toolbar',
    webPreferences: { backgroundThrottling: false },
  });

  timeEffectWin.loadURL('data:text/html;base64,' + Buffer.from(html).toString('base64'));

  setTimeout(() => {
    if (timeEffectWin && !timeEffectWin.isDestroyed()) {
      timeEffectWin.close();
      timeEffectWin = null;
    }
  }, 4000);
}
// ── IPC handlers ──────────────────────────────────────

ipcMain.on('move-window', (event, { x, y }) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || win;
  if (targetWin) targetWin.setPosition(Math.round(x), Math.round(y));
});

ipcMain.on('resize-window', (event, { width, height, animate }) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || win;
  if (targetWin) {
    const [x, y] = targetWin.getPosition();
    const opts = { x, y, width, height };
    targetWin.setBounds(opts, animate === true);
  }
});

ipcMain.on('get-window-position', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || win;
  if (targetWin) {
    const [x, y] = targetWin.getPosition();
    event.returnValue = { x, y };
  }
});

ipcMain.on('show-context-menu', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || win;
  const hasClones = BrowserWindow.getAllWindows().length > 1;
  const template = [
    { label: '报时 🕐', click: () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2,'0');
      const m = now.getMinutes().toString().padStart(2,'0');
      showScreenTime(h + ':' + m);
    } },
  ];

  if (hasClones) {
    template.push(
      { label: '分身全部召回 🌀', click: () => {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(w => { if (w !== win && !w.isDestroyed()) w.close(); });
        targetWin.webContents.executeJavaScript(`showFloatingText('分身回收完毕 🌀', 2000)`);
      } }
    );
  }

  template.push(
    { type: 'separator' },
    { label: '打开终端 🖥️', click: () => { try { const tmp = '/tmp/claw-session.command'; require("fs").writeFileSync(tmp, '#!/bin/bash\nopenclaw\nexec bash\n'); require('fs').chmodSync(tmp, 0o755); exec('open "' + tmp + '"'); } catch(e) {} } },
    { label: '打开网页版 🌐', click: () => { shell.openExternal('http://127.0.0.1:18789'); } },
    { type: 'separator' },
    { label: '隐藏到顶部栏', click: () => { if (targetWin) targetWin.hide(); } },
    { type: 'separator' },
    { label: '重启 Claw', click: () => { app.relaunch(); app.exit(0); } },
    { type: 'separator' },
    { label: '退出', click: () => { app.isQuitting = true; app.quit(); } },
  );

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: targetWin });
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('hide-to-tray', () => {
  if (win) win.hide();
});

// ── Clone window (分身术) ────────────────────────────

let cloneCount = 0;

ipcMain.on('clone-window', () => {
  cloneCount++;
  const displays = require('electron').screen.getPrimaryDisplay();
  const { width: sw, height: sh } = displays.workAreaSize;

  // Random position on screen
  const randX = Math.floor(Math.random() * (sw - 200));
  const randY = Math.floor(Math.random() * (sh - 200));

  const cloneWin = new BrowserWindow({
    width: 134,
    height: 130,
    x: randX,
    y: randY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    type: 'toolbar',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  cloneWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  cloneWin.setAlwaysOnTop(true, 'floating');
  cloneWin.loadFile('index.html');

  // Doesn't auto-close — stays until user closes it
});

// ── App lifecycle ─────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// Don't quit when window closes — tray keeps running
app.on('window-all-closed', () => {});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (win) {
    win.show();
  }
});
