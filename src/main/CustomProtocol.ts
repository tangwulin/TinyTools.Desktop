import { protocol } from 'electron'
import path from 'path'
import { getFileThumbnailByCache } from './utils/FSUtil'

export const registerPrivateProtocol = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'cache',
      privileges: { standard: true, secure: true, supportFetchAPI: true }
    }
  ])
}

export const registerCustomProtocol = () => {
  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.substring(7)
    callback(decodeURI(path.normalize(url)))
  })

  protocol.registerHttpProtocol('filethumbnail', (request, callback) => {
    const filePath = decodeURI(request.url.substring(16))
    getFileThumbnailByCache(filePath).then((thumbnailFile) => {
      callback({ statusCode: 302, headers: { Location: 'atom://' + thumbnailFile } })
    })
  })
}
