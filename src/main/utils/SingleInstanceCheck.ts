import { app } from 'electron'
import { focusMainWindow } from '../Window'

export function SingleInstanceCheck() {
  //限制只能开启一个应用(4.0以上版本)
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => focusMainWindow())
  }
}
