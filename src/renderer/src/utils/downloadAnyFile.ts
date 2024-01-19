const downloadAnyFile = (url: Request | string | URL, filename?: string) =>
  fetch(url)
    .then(async (res) => {
      const blob = await res.blob()
      // 如果未提供 filename，则从 URL 获取文件名
      if (!filename) {
        const contentDisposition = res.headers.get('content-disposition')
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].trim().replace(/["']/g, '') // 去掉可能存在的引号
        } else {
          // 如果无法从 Content-Disposition 获取文件名，尝试从 URL 获取
          const urlParts =
            typeof url === 'string'
              ? url?.split('/')
              : 'pathname' in url
                ? url?.pathname?.split('/')
                : [] //copied from https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
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

export default downloadAnyFile
