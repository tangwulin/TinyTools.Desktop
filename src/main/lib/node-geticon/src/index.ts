const nativeModule = require("../build/Release/addon.node")

export function init(skipComInit: Boolean): void {
    return nativeModule.init(skipComInit)
}

export function getThumbnail(path: String, mime: String): Buffer {
    return Buffer.from(nativeModule.getThumbnail(path, mime) as ArrayBuffer)
}

module.exports = {
    init, getThumbnail
}