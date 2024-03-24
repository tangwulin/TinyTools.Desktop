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
    const { host, pathname, searchParams } = new URL(url)
    // const paths = decodeURI(pathname).split('/')
    // const lastIndex = paths.length - 1
    // paths[lastIndex] = searchParams.toString() + '&' + paths[lastIndex]
    // const filename = host + paths.join('\\')
    // return path.join(this.cachePath, filename)
    return path.join(
      this.cachePath,
      host,
      decodeURI(pathname).replace(' ', '#') +
        (searchParams.toString() ? '#' + searchParams.toString() : '')
    )
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
    path.join(app.getPath('temp'), 'tinytools-cache'),
    10 * 1024 * 1024 * 1024
  ) // 10GB

  protocol.handle('cache', async (request) => {
    const url = decodeURIComponent(new URL(request.url).searchParams.get('url') ?? '')
    if (!url) return new Response(null, { status: 400 })
    const cache = await cacheService.getCache(url)
    return new Response(null, { status: 302, headers: { location: encodeURI(cache ?? url) } })
  })
}
