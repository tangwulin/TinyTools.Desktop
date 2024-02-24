import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { addDownloadTask } from '../utils/Downloader'
import { exists } from '../utils/FSUtil'

export class CacheService {
  cachePath: string
  maxCacheSize: number

  constructor(cachePath: string, maxCacheSize: number) {
    this.cachePath = cachePath
    this.maxCacheSize = maxCacheSize
  }

  getPath(url: string) {
    const removeQuery = url.split('?')[0]
    const removeProtocol = removeQuery.replace(/^(https?|ftp):\/\//i, '')
    return (this.cachePath + '\\' + removeProtocol).replace(/\//g, String.raw`\/`[0])
  }

  async getCache(key: string) {
    const filePath = this.getPath(key)
    console.log('getCache', filePath)
    if (await exists(filePath)) {
      return 'atom://' + filePath
    }
    return undefined
  }

  async addCache(key: string) {
    const filePath = this.getPath(key)
    const dirname = path.dirname(filePath)
    const basename = path.basename(filePath)
    console.log('addCache', key, dirname, basename)
    // await downloadFile(key, dirname, basename)
    addDownloadTask(key, dirname, basename)
  }
}

export function launchCacheService() {
  const cacheInst = new CacheService(path.join(__dirname, '../../cache'), 10 * 1024 * 1024 * 1024) //10GB

  ipcMain.handle('getCache', async (_, key) => {
    return await cacheInst.getCache(key)
  })

  ipcMain.handle('addCache', async (_, key) => {
    return await cacheInst.addCache(key)
  })

  ipcMain.handle('delCache', async (_, key) => {
    const filePath = cacheInst.getPath(key)
    if (await exists(filePath)) {
      await fs.promises.rm(filePath)
    }
  })
}
