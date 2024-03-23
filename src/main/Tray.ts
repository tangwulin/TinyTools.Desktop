import { app, Menu, Tray } from 'electron'
import { join } from 'path'
import { showOrCreateMainWindow } from './Window'

export const createTray = () => {
  const tray = new Tray(join(__dirname, '../../resources/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: '打开主界面',
      click: () => showOrCreateMainWindow
    },
    {
      type: 'normal',
      label: '退出',
      click: () => app.exit()
    }
  ])
  tray.setToolTip('TinyTools.Desktop')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => showOrCreateMainWindow())
}
