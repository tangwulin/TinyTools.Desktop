import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { downloadFile } from '../utils/Downloader'
import { fileExists } from '../utils/FSUtil'

export class CacheService {
  cachePath: string
  maxCacheSize: number

  constructor(cachePath: string, maxCacheSize: number) {
    this.cachePath = cachePath
    this.maxCacheSize = maxCacheSize
  }

  getPath(url: string) {
    return `${this.cachePath}/${removeProtocolFromUrl(url.split('?')[0]).replace(/\//g, '\\')}`
  }

  async getCache(key: string) {
    const filePath = this.getPath(key)
    console.log('filePath', filePath)
    if (await fileExists(filePath)) {
      return 'atom://' + filePath
    }
    return undefined
  }

  async setCache(key: string, value: any) {
    const filePath = this.getPath(key)
    await fs.promises.writeFile(filePath, value)
  }

  async addCache(key: string) {
    const filePath = this.getPath(key)
    console.log('addCache', filePath)
    await downloadFile(key, path.dirname(filePath), path.basename(filePath))
  }
}

function removeProtocolFromUrl(url: string) {
  // 匹配 URL 中的协议部分，并将其替换为空字符串
  return url.replace(/^(https?|ftp):\/\//i, '')
}

export function launchCacheService() {
  const cacheInst = new CacheService(path.join(__dirname, 'cache'), 10 * 1024 * 1024 * 1024) //10GB

  ipcMain.handle('getCache', async (_, key) => {
    return await cacheInst.getCache(key)
  })

  ipcMain.handle('setCache', async (_, key, value) => {
    return await cacheInst.setCache(key, value)
  })

  ipcMain.handle('addCache', async (_, key) => {
    return await cacheInst.addCache(key)
  })

  ipcMain.handle('delCache', async (_, key) => {
    const filePath = cacheInst.getPath(key)
    if (await fileExists(filePath)) {
      await fs.promises.rm(filePath)
    }
  })
}
