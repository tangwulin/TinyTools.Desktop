import { app } from 'electron'
import fs from 'fs'
import { Stats } from 'node:fs'
import path from 'path'
import logger from '../Logger'
import { getThumbnail } from './GetFileThumbnail'

const cachesPath = path.join(app.getPath('temp'), 'tinytools-cache')

export const getFilesAndFoldersInDir = async (
  dir: string
): Promise<
  {
    name: string
    path: string
    stats: Stats
  }[]
> => {
  logger.debug('getFilesAndFoldersInDir', dir)
  const files = await fs.promises.readdir(dir)
  return Promise.all(
    files.map(async (item) => {
      const file = path.join(dir, item)
      const stats = await fs.promises.stat(file)
      return {
        name: item,
        path: file,
        stats
      }
    })
  )
}

const thumbnailCache = new Map<string, string>()
const getItsOwnIcon = async (filePath: string) => {
  const fileName = path.basename(filePath)
  const iconPath = path.join(cachesPath, fileName + '.png')

  if (thumbnailCache.has(filePath)) {
    return thumbnailCache.get(filePath) as string
  }

  if (!(await exists(iconPath))) {
    const iconBuffer = await getThumbnail(filePath, 'image/png')
    await fs.promises.writeFile(iconPath, iconBuffer)
    thumbnailCache.set(filePath, iconPath)
  }
  return iconPath
}

export const getFileThumbnailByCache = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath)
  //判断是否是ppt
  if (isPPT(ext)) {
    return await getItsOwnIcon(filePath)
  }

  //图片相关逻辑
  if (isPicture(ext)) {
    const stats = await fs.promises.stat(filePath)

    //大小小于6M的图片直接返回
    if (stats.size < 1024 * 1024 * 6) {
      return filePath
    }

    //大于10M的图片返回统一的图标
    const iconPath = path.join(cachesPath, ext + '.png')
    if (thumbnailCache.has(iconPath)) {
      return iconPath
    }

    if (!(await exists(iconPath))) {
      //创建一个空的对应扩展名的文件，再生成缩略图
      const examplePath = path.join(cachesPath, `example.${ext}`)
      await fs.promises.writeFile(examplePath, '')
      const iconBuffer = await getThumbnail(examplePath, 'image/png')
      await fs.promises.writeFile(iconPath, iconBuffer)
      thumbnailCache.set(iconPath, iconPath)
    }

    return iconPath
  }

  if (isVideo(ext)) {
    return await getItsOwnIcon(filePath)
  }

  if (isAudio(ext)) {
    return await getItsOwnIcon(filePath)
  }

  //exe和lnk文件返回自己的图标
  if (ext === '.exe' || ext === '.lnk') {
    return await getItsOwnIcon(filePath)
  }

  //其余照常
  return await getItsOwnIcon(filePath)
}

export const isPicture = (ext: string) => {
  return [
    '.xbm',
    '.tif',
    '.pjp',
    '.svgz',
    '.jpg',
    '.jpeg',
    '.ico',
    '.tiff',
    '.gif',
    '.svg',
    '.jfif',
    '.webp',
    '.png',
    '.bmp',
    '.pjpeg',
    '.avif',
    '.heic'
  ].includes(ext.toLowerCase())
}

export const isVideo = (ext: string) => {
  return [
    '.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.mkv',
    '.webm',
    '.mpg',
    '.mpeg',
    '.3gp'
  ].includes(ext.toLowerCase())
}

export const isAudio = (ext: string) => {
  return ['.mp3', '.wav', '.wma', '.ogg', '.flac', '.aac', '.m4a'].includes(ext.toLowerCase())
}

export const isDocument = (ext: string) => {
  return ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.txt'].includes(
    ext.toLowerCase()
  )
}

export const isPPT = (ext: string) => {
  return ['.ppt', '.pptx'].includes(ext.toLowerCase())
}

export async function exists(filePath: string) {
  try {
    await fs.promises.access(filePath)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}
