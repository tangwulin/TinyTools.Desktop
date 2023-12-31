import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, Menu, screen, shell, Tray } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

let tray = null as Tray | null
let mainWindow = null as BrowserWindow | null

function createWindow(): void {
  // We cannot require the screen module until the app is ready.
  // const { screen } = require('electron')

  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay()
  const height = primaryDisplay.size.height

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: (height / 1080) * 1080,
    height: (height / 1080) * 650,
    minWidth: (height / 1080) * 1080,
    minHeight: (height / 1080) * 650,
    show: false,
    center: true,
    enableLargerThanScreen: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: join(__dirname, '../../resources/icon.png')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // mainWindow.on('close', (e) => {
  //   e.preventDefault()
  //   mainWindow.hide()
  // })

  tray = new Tray(join(__dirname, '../../resources/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: '打开主界面',
      click: () => mainWindow?.show()
    },
    {
      type: 'normal',
      label: '退出',
      click: () => app.exit()
    }
  ])
  tray.setToolTip('TinyTools.Desktop')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
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

  let dockWindow = null as BrowserWindow | null

  ipcMain.on('openDockWindow', () => {
    if (dockWindow) {
      dockWindow.show()
      return
    }
    // We cannot require the screen module until the app is ready.
    // const { screen } = require('electron')

    // Create a window that fills the screen's available work area.
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.size

    dockWindow = new BrowserWindow({
      width: width * 0.5,
      height: height * 0.15,
      x: width * 0.25,
      y: height * 0.75,
      show: false,
      transparent: true,
      frame: false,
      resizable: false,
      movable: true,
      enableLargerThanScreen: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      dockWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/dock')
    } else {
      dockWindow.loadFile(join(__dirname, '../renderer/index.html/'), {
        hash: '/dock'
      })
    }

    dockWindow.on('ready-to-show', () => {
      dockWindow?.show()
    })
  })

  ipcMain.on('closeDockWindow', () => {
    if (dockWindow) {
      dockWindow.close()
      dockWindow = null
    }
  })

  ipcMain.on('relaunchApp', () => {
    app.relaunch()
    app.exit()
  })

  //限制只能开启一个应用(4.0以上版本)
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        mainWindow.show()
      }
    })
  }

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
