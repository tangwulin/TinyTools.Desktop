import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow, ipcMain, Menu, protocol, screen, shell, Tray } from 'electron'
// import { createGiteeUpdaterOptions } from './gitee-updater-ts'
import { autoUpdater } from 'electron-updater'
// import { NsisUpdater } from 'electron-updater'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { registerIPC } from './IPC'
import { registerIPC } from './IPCHelper'
import { launchCacheService } from './services/CacheService'
import { launchResourceService } from './services/ResourceService'
import { createTray } from './Tray'
import { launchUpdater } from './UpdaterHelper'
import { launchDownloader } from './utils/Downloader'
import { SingleInstanceCheck } from './utils/SingleInstanceCheck'
import { createMainWindow } from './Window'
import { logger } from './Logger'

let tray = null as Tray | null
let mainWindow = null as BrowserWindow | null
let dockWindow = null as BrowserWindow | null

tray = null
mainWindow = null
dockWindow = null

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://a3ae7a7848252f65da88af57ffa2b59d@o4506597396381696.ingest.sentry.io/4506597399199744'
  })
}

// if (!app.isPackaged) {
//   Object.defineProperty(app, 'isPackaged', {
//     get: () => true
//   })
// }

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('org.tangwulin.tinytools')

  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.substring(7)
    callback(decodeURI(path.normalize(url)))
  })

  SingleInstanceCheck(mainWindow)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow(mainWindow)
  createTray(tray, mainWindow)
  registerIPC(dockWindow)
  launchDownloader()
  launchCacheService()
  launchUpdater(mainWindow, logger)
  launchResourceService()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow(mainWindow)
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
