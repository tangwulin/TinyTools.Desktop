import { is } from '@electron-toolkit/utils'
import { app, ipcMain } from 'electron'
import { join } from 'path'
import { getFilesAndFoldersInDir, getFileThumbnailByCache } from './utils/FSUtil'
import { closeDockWindow, showOrCreateDockWindow } from './Window'

export function registerIPC() {
  ipcMain.on('relaunchApp', () => {
    app.relaunch()
    app.exit()
  })

  ipcMain.handle('getThumbnail', async (_, ...args) => {
    return getFileThumbnailByCache(args[0])
  })

  ipcMain.handle('getRendererPath', () => {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      return process.env['ELECTRON_RENDERER_URL']
    } else {
      return join(__dirname, '../renderer/')
    }
  })

  ipcMain.on('closeDockWindow', () => {
    closeDockWindow()
  })

  ipcMain.on('openDockWindow', () => showOrCreateDockWindow())

  ipcMain.handle('getFileList', async (_, [path]) => {
    return getFilesAndFoldersInDir(path)
  })
}
