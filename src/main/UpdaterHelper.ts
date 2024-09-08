// 将日志在渲染进程里面打印出来
import { ipcMain } from 'electron'
import { createGiteeUpdaterOptions } from './gitee-updater-ts'
import { NsisUpdater } from 'electron-updater'
import logger from './Logger'
import { sentMessageToMainWindow } from './Window'

export function printUpdaterMessage(arg) {
  const message = {
    error: '更新出错',
    checking: '正在检查更新',
    updateAvailable: '检测到新版本',
    downloadProgress: '下载中',
    updateNotAvailable: '无新版本'
  }
  sentMessageToMainWindow('printUpdaterMessage', message[arg] ?? arg)
}

export const launchUpdater = () => {
  const updaterOptions = createGiteeUpdaterOptions({
    repo: 'twl12138/TinyTools.Desktop',
    updateManifest: 'latest.yml'
  })

  const autoUpdater = new NsisUpdater(updaterOptions)

  // const header1 = import.meta.env.VITE_UPDATE_HEADER1
  //
  // const headers = {}
  // headers[header1] = import.meta.env.VITE_UPDATE_HEADER1_VALUE
  //
  // const feedUrl = import.meta.env.VITE_UPDATE_URL

  autoUpdater.logger = logger
  // 配置提供更新的程序，及build中配置的url
  // autoUpdater.setFeedURL({
  //   provider: 'generic',
  //   url: feedUrl,
  //   useMultipleRangeRequest: false,
  //   requestHeaders: headers
  // })
  autoUpdater.autoRunAppAfterInstall = true
  autoUpdater.forceDevUpdateConfig = true

  // 配置请求头

  // 是否自动更新，如果为true，当可以更新时(update-available)自动执行更新下载。
  autoUpdater.autoDownload = false

  // 1. 在渲染进程里触发获取更新，开始进行更新流程。 (根据具体需求)
  ipcMain.on('checkForUpdates', () => {
    autoUpdater.checkForUpdates()
  })

  autoUpdater.on('error', function (error) {
    printUpdaterMessage('error')
    sentMessageToMainWindow('updateError', error)
  })

  // 2. 开始检查是否有更新
  autoUpdater.on('checking-for-update', function () {
    printUpdaterMessage('checking')
  })

  // 3. 有更新时触发
  autoUpdater.on('update-available', function (info) {
    printUpdaterMessage('updateAvailable')
    // 4. 告诉渲染进程有更新，info包含新版本信息
    sentMessageToMainWindow('updateAvailable', info)
  })

  // 7. 收到确认更新提示，执行下载
  ipcMain.on('confirmUpdate', () => {
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', () => {
    printUpdaterMessage('updateNotAvailable')
  })

  // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
  // ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-autoUpdater\pending下的缓存文件将其删除（这是我本地的路径）
  autoUpdater.on('download-progress', function (progressObj) {
    printUpdaterMessage('downloadProgress')
    sentMessageToMainWindow('downloadProgress', progressObj)
  })

  // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
  autoUpdater.on('update-downloaded', function () {
    sentMessageToMainWindow('updateDownloaded')
    // 12. 立即更新安装
    ipcMain.on('updateNow', () => {
      autoUpdater.quitAndInstall(true, true)
    })
  })
}
