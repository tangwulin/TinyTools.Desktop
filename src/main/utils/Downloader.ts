import fs from 'fs'
import Downloader from 'nodejs-file-downloader'
import logger from '../Logger'

import { exists } from './FSUtil'

type DownloadTask = { url: string; directory: string; fileName: string }

let downloaderManager: DownloaderManager

export function launchDownloader() {
  downloaderManager = new DownloaderManager(3) // 最大并发下载数量为3
}

export function addDownloadTask(url: string, directory: string, fileName: string) {
  downloaderManager.addTask({ url, directory, fileName })
}

class DownloaderManager {
  maxThreads: number // 最大工作线程数量
  runningTasks: number // 当前运行的下载任务数量
  downloadQueue: DownloadTask[] // 下载任务队列
  constructor(maxThreads: number) {
    this.maxThreads = maxThreads // 最大工作线程数量
    this.runningTasks = 0 // 当前运行的下载任务数量
    this.downloadQueue = [] // 下载任务队列
  }

  // 添加下载任务到队列中
  addTask(DownloadTask) {
    this.downloadQueue.push(DownloadTask)
    this.startDownload() // 尝试启动下载任务
  }

  // 启动下载任务
  startDownload() {
    while (this.runningTasks < this.maxThreads && this.downloadQueue.length > 0) {
      const task = this.downloadQueue.shift() as DownloadTask
      this.runningTasks++
      this.downloadFile(task.url, task.directory, task.fileName)
        .then(() => {
          this.runningTasks--
          this.startDownload() // 下载完成后尝试启动新的下载任务
        })
        .catch((error) => {
          logger.error(`Error downloading file: ${error}`)
          this.runningTasks--
          this.startDownload() // 下载失败时尝试启动新的下载任务
        })
    }
  }

  downloadFile = async (url: string, directory: string, fileName: string) => {
    if (!(await exists(directory))) {
      await fs.promises.mkdir(directory, { recursive: true })
    }
    const downloader = new Downloader({
      url: encodeURI(url),
      directory,
      fileName
    })
    try {
      logger.info(`Start download ${encodeURI(url)}`)
      await downloader.download()
      logger.info(`Download success ${encodeURI(url)}`)
    } catch (e) {
      logger.error(`Download failed ${encodeURI(url)}`)
    }
  }
}
