import { execSync } from 'child_process'
import fs from 'fs'
import path, { join } from 'path'

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

export const getFileIcon = (filePath: string) => {
  const cachesPath = path.resolve(__dirname, '../../caches')
  return execSync(
    join(__dirname, '../../resources/bin/ExtractPngOfExtIconCpp.exe') +
      ` -file ${filePath}` +
      ` -O ${cachesPath}`
  ).toString()
}

export const getFileIconByCache = (filePath: string) => {
  const ext = path.extname(filePath)
  if (isPicture(ext)) {
    return filePath //TODO
  } else {
    const cachesPath = path.resolve(__dirname, '../../caches')
    const iconPath = `${cachesPath}/${ext}.png`
    if (!fs.existsSync(iconPath) || ext === 'exe' || ext === 'lnk') {
      return getFileIcon(filePath)
    } else {
      return iconPath
    }
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
