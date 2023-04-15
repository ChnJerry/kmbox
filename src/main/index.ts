import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const windowStateKeeper = require('electron-window-state')

let mainWindow
let fyMonitorWindow
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    minWidth: 1100,
    minHeight: 550,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    // 固定宽高
    // resizable: false,
    ...(process.platform === 'linux'
      ? {
        icon: path.join(__dirname, '../../build/icon.png')
      }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  mainWindow.on("close", (e) => {
    e.preventDefault()
    mainWindow.webContents.send("close")
  })
  ipcMain.handle('destroy', () => {
    mainWindow.destroy()
  })
  ipcMain.handle("window-min", () => {
    mainWindow.minimize()
  });
  ipcMain.handle("window-max", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else mainWindow.maximize()
  });
  ipcMain.handle("close", (_event, whichWindow) => {
    if (whichWindow === 'mainWindow') mainWindow.close()
    else if (whichWindow === 'fyMonitorWindow') fyMonitorWindow.close()
  });
  ipcMain.handle("openDev", () => {
    mainWindow.webContents.openDevTools()
  })
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
  ipcMain.handle('window-open-event', () => {
    const winState = new windowStateKeeper({
      defaultHeight: 450,
      defaultWidth: 350,
      electronStoreOptions: {
        name: 'fyMonitorWindow'
      }
    })
    fyMonitorWindow = new BrowserWindow({
      x: winState.x,
      y: winState.y,
      width: winState.width,
      height: winState.height,
      minWidth: 300,
      minHeight: 400,
      maxWidth: 500,
      maxHeight: 600,
      show: false,
      frame: false,
      autoHideMenuBar: true,
      // parent: mainWindow,
      transparent: true,
      webPreferences: {
        // preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: false
      }
    })
    fyMonitorWindow.on('ready-to-show', () => fyMonitorWindow.show())
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      fyMonitorWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/extraWindow.html')
    } else {
      fyMonitorWindow.loadFile(path.join(__dirname, '../renderer/extraWindow.html'))
    }
    winState.manage(fyMonitorWindow)
  })
  ipcMain.handle('set-always-top', (_event, status) => {
    if(status) fyMonitorWindow.setAlwaysOnTop(true)
    else if(!status) fyMonitorWindow.setAlwaysOnTop(false)
  })
  ipcMain.handle('change-mouse-penetrate-state', (_event, status) => {
    if(status) fyMonitorWindow.setIgnoreMouseEvents(true)
    else fyMonitorWindow.setIgnoreMouseEvents(false)
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}
// 限制只能打开一个实例，且打开第二个的时候唤醒第一个实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
