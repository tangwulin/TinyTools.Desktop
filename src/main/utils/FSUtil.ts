import fileIcon from 'extract-file-icon-fix'
import fs from 'fs'
import path from 'path'

export const getFilesAndFoldersInDir = (dir: string) => {
  return fs.promises.readdir(dir).then((files) => {
    return files.map((item) => {
      const path = `${dir}/${item}`
      const stats = fs.statSync(path)
      return {
        name: item,
        path,
        isDirectory: stats.isDirectory()
      }
    })
  })
}

export const getFileIconByCache = async (filePath: string) => {
  const ext = path.extname(filePath)
  if (isPicture(ext)) {
    const stats = await fs.promises.stat(filePath)
    //大小小于10M的图片直接返回
    if (stats.size < 1024 * 1024 * 10) {
      return filePath
    }

    //大于10M的图片返回统一的图标
    const cachesPath = path.resolve(__dirname, '../../caches')
    const iconPath = `${cachesPath}/${ext}.png`
    if (!fs.existsSync(iconPath)) {
      const iconBuffer = fileIcon(filePath, 256)
      await fs.promises.writeFile(iconPath, iconBuffer)
    }
    return iconPath
  } else {
    const cachesPath = path.resolve(__dirname, '../../caches')
    //exe和lnk文件返回自己的图标
    if (ext === '.exe' || ext === '.lnk') {
      const fileName = path.basename(filePath)
      const iconPath = `${cachesPath}/${fileName}.png`
      if (!fs.existsSync(iconPath)) {
        const iconBuffer = fileIcon(filePath, 256)
        await fs.promises.writeFile(iconPath, iconBuffer)
      }
      return iconPath
    }

    //其余照常
    const iconPath = `${cachesPath}/${ext}.png`
    if (!fs.existsSync(iconPath)) {
      const iconBuffer = fileIcon(filePath, 256)
      await fs.promises.writeFile(iconPath, iconBuffer)
    }
    return iconPath
  }
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
