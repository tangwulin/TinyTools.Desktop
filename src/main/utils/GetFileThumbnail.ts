import getIcon from 'node-geticon'
import logger from '../Logger'
;(() => {
  getIcon.init(false)
  logger.info('geticon init')
})()

type GdiPlusImageFormat = 'image/bmp' | 'image/jpeg' | 'image/gif' | 'image/tiff' | 'image/png'
export const getThumbnail = async (
  filePath: string,
  format: GdiPlusImageFormat = 'image/png'
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const iconBuffer = getIcon.getThumbnail(filePath, format)
      if (iconBuffer.length === 0) {
        reject('Failed to get thumbnail')
      }
      resolve(iconBuffer)
    } catch (e) {
      reject(e)
    }
  })
}
