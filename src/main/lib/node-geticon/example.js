/*
    geticon.init(skipComInit: Boolean)
    geticon.getThumbnail(path: String, mime: String): ArrayBuffer
*/

const geticon = require('./dist/index')
const fs = require('node:fs')
geticon.init()
const result = geticon.getThumbnail('I:\\node-geticon-example\\你好.pptx', 'image/png')
console.log(result)
fs.writeFileSync('testout.png', Buffer.from(result))
