'use strict';

const { app, ipcMain, BrowserWindow, Tray} = require('electron');
const path = require('path');

const imgDir = path.join(__dirname, 'src/assets/img');

let tray = undefined;
let window = undefined;

// 不显示App到Dock
app.dock.hide();

app.on('ready', () => {
  createTray();
  createWindow();
});
// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const createTray = () => {
  tray = new Tray(path.join(imgDir, 'menuIcon.png'));
  tray.on('right-click', toggleWindow);
  tray.on('double-click', toggleWindow);
  tray.on('click', function (event) {
    toggleWindow();
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'});
    }
  })
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayBounds.y + trayBounds.height + 2)
  return {x: x, y: y}
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 340,
    height: 416,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      backgroundThrottling: false
    }
  });
  window.loadURL(`file://${path.join(__dirname, 'src/index.html')}`);
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  });
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
};

ipcMain.on('show-window', () => {
  showWindow();
});
