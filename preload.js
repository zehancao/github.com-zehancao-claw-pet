const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  resizeWindow: (width, height, animate) =>
    ipcRenderer.send('resize-window', { width, height, animate }),
  getWindowPosition: () => ipcRenderer.sendSync('get-window-position'),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  quit: () => ipcRenderer.send('quit-app'),
  hideToTray: () => ipcRenderer.send('hide-to-tray'),
  cloneWindow: () => ipcRenderer.send('clone-window'),
});
