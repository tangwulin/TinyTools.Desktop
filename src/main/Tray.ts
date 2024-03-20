import { app, BrowserWindow, Menu, Tray } from 'electron'
import { join } from 'path'
import { createMainWindow } from './Window'

export const createTray = (tray: Tray | null, window: BrowserWindow | null) => {
  tray = new Tray(join(__dirname, '../../resources/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: '打开主界面',
      click: () => (window ? window.show() : createMainWindow(window))
    },
    {
      type: 'normal',
      label: '退出',
      click: () => app.exit()
    }
  ])
  tray.setToolTip('TinyTools.Desktop')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => (window ? window.show() : createMainWindow(window)))
}
