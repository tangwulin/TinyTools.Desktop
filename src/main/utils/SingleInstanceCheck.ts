import { app, BrowserWindow } from 'electron'

export function SingleInstanceCheck(window: BrowserWindow | null) {
  //限制只能开启一个应用(4.0以上版本)
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
      if (window) {
        if (window.isMinimized()) window.restore()
        window.focus()
        window.show()
      }
    })
  }
}
