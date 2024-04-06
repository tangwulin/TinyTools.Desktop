import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png'
import logger from './Logger'

let mainWindow: BrowserWindow | null = null
let dockWindow: BrowserWindow | null = null

export function showOrCreateMainWindow(): void {
  logger.info('show or create main window')
  if (mainWindow) {
    mainWindow.show()
    return
  }
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
    logger.info('main window ready to show')
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    mainWindow = null //把主窗口对象设置为null，方便后续判断主窗口是否存在
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  let times = 1

  function loadDev() {
    mainWindow!
      .loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/')
      .then(() => console.log('loadURL'))
      .catch(() => {
        if (times > 5) {
          console.log('loadURL failed, try to reload the main window')
          closeMainWindow()
          showOrCreateMainWindow()
        } else {
          console.log(`retry loadURL:${times}`)
          times++
          loadDev()
        }
      })
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loadDev()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function closeMainWindow(): void {
  logger.info('close main window')
  mainWindow?.close()
  mainWindow = null
}

export function focusMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    mainWindow.show()
  } else {
    showOrCreateMainWindow()
  }
}

export function sentMessageToMainWindow(channel: string, ...args: any[]): void {
  mainWindow?.webContents.send(channel, ...args)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
export function showOrCreateDockWindow() {
  logger.info('show or create dock window')
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

  let times = 1
  function loadDev() {
    dockWindow!
      .loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/dock')
      .then(() => console.log('dock window loaded'))
      .catch(() => {
        if (times > 5) {
          console.log('loadURL failed, try to reload the dock window')
          closeDockWindow()
          showOrCreateDockWindow()
        } else {
          console.log(`retry load dock window:${times}`)
          times++
          loadDev()
        }
      })
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loadDev()
  } else {
    dockWindow.loadFile(join(__dirname, '../renderer/index.html/'), {
      hash: '/dock'
    })
  }

  dockWindow.on('ready-to-show', () => {
    logger.info('dock window ready to show')
    dockWindow?.show()
  })
}

export function closeDockWindow(): void {
  logger.info('close dock window')
  dockWindow?.close()
  dockWindow = null
}
