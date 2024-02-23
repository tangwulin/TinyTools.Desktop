import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import * as Sentry from '@sentry/electron'
import { app, BrowserWindow, ipcMain, Menu, protocol, screen, shell, Tray } from 'electron'
import { NsisUpdater } from 'electron-updater'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { createGiteeUpdaterOptions } from './gitee-updater-ts'
import { registerIPC } from './IPC'
import { launchCacheService } from './services/CacheService'

let tray = null as Tray | null
let mainWindow = null as BrowserWindow | null

if (app.isPackaged) {
  Sentry.init({
    dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744'
  })
}

// 将日志在渲染进程里面打印出来
function printUpdaterMessage(arg) {
  const message = {
    error: '更新出错',
    checking: '正在检查更新',
    updateAvailable: '检测到新版本',
    downloadProgress: '下载中',
    updateNotAvailable: '无新版本'
  }
  if (mainWindow) mainWindow.webContents.send('printUpdaterMessage', message[arg] ?? arg)
}

function createMainWindow(): void {
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

  mainWindow.on('close', () => {
    mainWindow = null //把主窗口对象设置为null，方便后续判断主窗口是否存在
  })

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

const createTray = () => {
  tray = new Tray(join(__dirname, '../../resources/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: '打开主界面',
      click: () => (mainWindow ? mainWindow.show() : createMainWindow())
    },
    {
      type: 'normal',
      label: '退出',
      click: () => app.exit()
    }
  ])
  tray.setToolTip('TinyTools.Desktop')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => (mainWindow ? mainWindow.show() : createMainWindow()))
}

const createUpdater = () => {
  const updaterOptions = createGiteeUpdaterOptions({
    repo: 'twl12138/TinyTools.Desktop',
    updateManifest: 'latest.yml'
  })

  const updater = new NsisUpdater(updaterOptions)

  // 配置提供更新的程序，及build中配置的url
  // autoUpdater.setFeedURL("oss://xxx")
  // 是否自动更新，如果为true，当可以更新时(update-available)自动执行更新下载。
  updater.autoDownload = false

  // 1. 在渲染进程里触发获取更新，开始进行更新流程。 (根据具体需求)
  ipcMain.on('checkForUpdates', () => {
    updater.checkForUpdates()
  })

  updater.on('error', function (error) {
    printUpdaterMessage('error')
    if (mainWindow) mainWindow.webContents.send('updateError', error)
  })

  // 2. 开始检查是否有更新
  updater.on('checking-for-update', function () {
    printUpdaterMessage('checking')
  })

  // 3. 有更新时触发
  updater.on('update-available', function (info) {
    printUpdaterMessage('updateAvailable')
    // 4. 告诉渲染进程有更新，info包含新版本信息
    if (mainWindow) mainWindow.webContents.send('updateAvailable', info)
  })

  // 7. 收到确认更新提示，执行下载
  ipcMain.on('confirmUpdate', () => {
    updater.downloadUpdate()
  })

  updater.on('update-not-available', () => {
    printUpdaterMessage('updateNotAvailable')
  })

  // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
  // ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-updater\pending下的缓存文件将其删除（这是我本地的路径）
  updater.on('download-progress', function (progressObj) {
    printUpdaterMessage('downloadProgress')
    if (mainWindow) mainWindow.webContents.send('downloadProgress', progressObj)
  })

  // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
  updater.on('update-downloaded', function () {
    if (mainWindow) mainWindow.webContents.send('updateDownloaded')
    // 12. 立即更新安装
    ipcMain.on('updateNow', () => {
      updater.quitAndInstall()
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
function showDockWindow(dockWindow: BrowserWindow | null) {
  return () => {
    if (dockWindow) {
      dockWindow.show()
      return
    }

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
      skipTaskbar: app.isPackaged,
      alwaysOnTop: !app.isPackaged, // 方便开发时调试
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
  }
}

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('org.tangwulin.tinytools')

  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.substring(7)
    callback(decodeURI(path.normalize(url)))
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
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow()
  createTray()
  registerIPC()
  launchCacheService()
  createUpdater()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils

  let dockWindow = null as BrowserWindow | null

  ipcMain.on('closeDockWindow', () => {
    if (dockWindow) {
      dockWindow.close()
      dockWindow = null
    }
  })

  ipcMain.on('openDockWindow', showDockWindow(dockWindow))

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
