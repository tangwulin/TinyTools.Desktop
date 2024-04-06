import { electronApp, optimizer } from '@electron-toolkit/utils'
import * as Sentry from '@sentry/electron/main'
import { installExtension, VUEJS_DEVTOOLS } from '@tomjs/electron-devtools-installer'
import { app, BrowserWindow } from 'electron'
import { registerCustomProtocol, registerPrivateProtocol } from './CustomProtocol'
// import { createGiteeUpdaterOptions } from './gitee-updater-ts'
// import { NsisUpdater } from 'electron-updater'
import { registerIPC } from './IPCHelper'
import logger from './Logger'
import { launchCacheService } from './services/CacheService'
import { createTray } from './Tray'
import { launchUpdater } from './UpdaterHelper'
import { launchDownloader } from './utils/Downloader'
import { SingleInstanceCheck } from './utils/SingleInstanceCheck'
import { showOrCreateMainWindow } from './Window'

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
registerPrivateProtocol()

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('org.tangwulin.tinytools')

  if (import.meta.env.DEV) {
    // Install Vue Devtools
    installExtension(VUEJS_DEVTOOLS)
      .then((ext) => logger.debug(`Added Extension: ${ext.name}`))
      .catch((err) => logger.error('An error occurred: ', err))
  }

  registerCustomProtocol()
  SingleInstanceCheck()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  showOrCreateMainWindow()
  createTray()
  registerIPC()
  launchDownloader()
  launchCacheService()
  launchUpdater()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) showOrCreateMainWindow()
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
