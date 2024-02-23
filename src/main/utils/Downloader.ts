import Downloader from 'nodejs-file-downloader'

export const downloadFile = async (url: string, directory: string, fileName: string) => {
  const downloader = new Downloader({
    url,
    directory,
    fileName
  })
  try {
    await downloader.download()
  } catch (error) {
    console.log(error)
  }
}
