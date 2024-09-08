import { is } from '@electron-toolkit/utils'
import { app, dialog, ipcMain } from 'electron'
import fs from 'fs'
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

  ipcMain.handle('getFileList', async (_, path) => {
    return getFilesAndFoldersInDir(path)
  })

  ipcMain.handle('getAppPath', () => {
    return app.getAppPath()
  })

  ipcMain.handle('getAppVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('showOpenDialog', (_, options) => {
    return dialog.showOpenDialog(options)
  })

  ipcMain.handle('pathExists', async (_, path) => {
    return await fs.promises
      .access(path)
      .then(() => true)
      .catch(() => false)
  })

  ipcMain.handle('createFolder', async (_, path) => {
    return await fs.promises.mkdir(path, { recursive: true })
  })

  ipcMain.handle('getPath', (_, name) => app.getPath(name))
}
