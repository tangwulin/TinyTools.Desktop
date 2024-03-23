import { app, protocol } from 'electron'
import path from 'path'
import logger from '../Logger'
import { addDownloadTask } from '../utils/Downloader'
import { exists } from '../utils/FSUtil'

export class CacheService {
  cachePath: string
  maxCacheSize: number
  cacheMap: Map<string, string>

  constructor(cachePath: string, maxCacheSize: number) {
    this.cachePath = cachePath
    this.maxCacheSize = maxCacheSize
    this.cacheMap = new Map()
  }

  getPath(url: string) {
    const removeQuery = url.split('?')[0]
    const removeProtocol = removeQuery.replace(/^(https?|ftp):\/\//i, '')
    return (this.cachePath + '\\' + removeProtocol).replace(/\//g, String.raw`\/`[0])
  }

  async getCache(key: string) {
    const filePath = this.getPath(key)
    logger.info('getCache', filePath)
    if (this.cacheMap.has(key) || (await exists(filePath))) {
      this.cacheMap.set(key, filePath)
      return 'atom://' + filePath
    }
    await this.addCache(key)
    return undefined
  }

  async addCache(key: string) {
    const filePath = this.getPath(key)
    const dirname = path.dirname(filePath)
    const basename = path.basename(filePath)
    logger.info('addCache', key, dirname, basename)
    addDownloadTask(key, dirname, basename)
  }
}

export function launchCacheService() {
  const cacheService = new CacheService(
    path.join(app.getPath('temp'), 'cache'),
    10 * 1024 * 1024 * 1024
  ) // 10GB

  protocol.handle('cache', async (request) => {
    const url = new URL(request.url).searchParams.get('url') ?? ''
    const cache = await cacheService.getCache(url)
    return new Response(null, { status: 302, headers: { location: encodeURI(cache ?? url) } })
  })
}
