/**
 * 就像它名字所描述的那样
 * @returns {string}
 */
export const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

/**
 * 就像它名字所描述的那样
 * @param {number} remValue
 * @returns {number}
 */
export const remToPx = remValue => {
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return remValue * baseFontSize
}

/**
 * 使用blob中转，用于解决electron环境下下载不正常的问题
 * @param {Request | string | URL} url
 * @param {string?} filename
 */
export const downloadAnyFile = (url, filename) => fetch(url)
  .then(async (res) => {
    const blob = await res.blob()
    // 如果未提供 filename，则从 URL 获取文件名
    if (!filename)
    {
      const contentDisposition = res.headers.get('content-disposition')
      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1)
      {
        filename = contentDisposition
          .split('filename=')[1]
          .trim()
          .replace(/["']/g, '') // 去掉可能存在的引号
      }
      else
      {
        // 如果无法从 Content-Disposition 获取文件名，尝试从 URL 获取
        const urlParts = url.split('/')
        filename = urlParts[urlParts.length - 1]
      }
    }

    const fileURL = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.download = filename
    a.href = fileURL
    document.body.appendChild(a)
    a.click()
    a.remove()
  })
  .catch((err) => {
    console.error(err)
  })
