import { is } from '@electron-toolkit/utils'
import { app, ipcMain } from 'electron'
import { join } from 'path'
import { getFileIconByCache } from './utils/FSUtil'

export function registerIPC() {
  ipcMain.on('relaunchApp', () => {
    app.relaunch()
    app.exit()
  })

  ipcMain.handle('getThumbnail', async (_, ...args) => {
    return getFileIconByCache(args[0])
  })

  ipcMain.handle('getRendererPath', () => {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      return process.env['ELECTRON_RENDERER_URL']
    } else {
      return join(__dirname, '../renderer/')
    }
  })
}
