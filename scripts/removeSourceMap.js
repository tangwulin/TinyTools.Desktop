const fs = require('fs')
const path = require('path')
const rendererPath = './out/renderer/assets'

const rendererList = fs.readdirSync(rendererPath)
rendererList.forEach((file) => {
  file = path.join(rendererPath, file)
  if (path.extname(file) === '.map') {
    fs.unlinkSync(file)
  }
})

const mainPath = './out/main'

const mainList = fs.readdirSync(mainPath)

mainList.forEach((file) => {
  file = path.join(mainPath, file)
  if (path.extname(file) === '.map') {
    fs.unlinkSync(file)
  }
})

const preloadPath = './out/preload'
const preloadList = fs.readdirSync(preloadPath)
preloadList.forEach((file) => {
  file = path.join(preloadPath, file)
  if (path.extname(file) === '.map') {
    fs.unlinkSync(file)
  }
})

const gExtension = '.js'
// const gSrcStr = '//# sourceMappingURL=[0-9A-Za-z]*.[0-9A-Za-z]*.[0-9A-Za-z]*.[0-9A-Za-z]*.js.map'
const gSrcStr = '//# sourceMappingURL=[0-9A-Za-z-.]*\\.js\\.map'
const gReplaceStr = ''

dirContentReplace(rendererPath, gExtension, gSrcStr, gReplaceStr) // 去掉js文件的sourcemap关联
dirContentReplace(mainPath, gExtension, gSrcStr, gReplaceStr)
dirContentReplace(preloadPath, gExtension, gSrcStr, gReplaceStr)
function dirContentReplace(filePath, extension, srcStr, replaceStr) {
  const fs = require('fs')
  const path = require('path')
  //readdir方法读取文件名
  fs.readdir(filePath, 'utf8', function (err, files) {
    if (err) return console.log(err)
    //根据后缀名筛选要操作的文件
    const targetFiles = files.filter(function (file) {
      return path.extname(file).toLowerCase() === extension
    })
    targetFiles.forEach(function (item) {
      const itemPath = path.join(filePath, item)
      //readFile方法读取文件内容
      fs.readFile(itemPath, 'utf8', function (err, data) {
        const result = data.replace(RegExp(srcStr, 'g'), replaceStr)
        //writeFile改写文件内容
        fs.writeFile(itemPath, result, 'utf8', function (err) {
          if (err) return console.log(err)
        })
      })
    })
  })
}
