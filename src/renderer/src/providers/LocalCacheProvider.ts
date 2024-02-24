import type { ElectronAPI } from '@electron-toolkit/preload'
import { CacheProvider } from '../interface/CacheProvider'

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

export class LocalCacheProvider implements CacheProvider {
  cacheMap: Map<string, string> = new Map()
  get = async (key: string) => {
    if (isElectron) {
      const value = this.cacheMap.get(key)
      if (value) {
        return value
      }
      //目前没解决这里的问题
      if (key.startsWith('https://api.kivo.wiki/assets/images/students/')) {
        return key
      }
      const result = (await electron.ipcRenderer.invoke('getCache', key)) as string | undefined
      if (result) {
        this.cacheMap.set(key, result)
      }
      return result
    }
    return new Promise<void>((_, reject) => reject('Not implemented'))
  }

  add = async (url: string) => {
    if (isElectron) {
      return (await electron.ipcRenderer.invoke('addCache', url)) as Promise<void>
    }
    return new Promise<void>((_, reject) => reject('Not implemented'))
  }

  del = async (key: string) => {
    if (isElectron) {
      return (await electron.ipcRenderer.invoke('delCache', key)) as Promise<void>
    }
    return new Promise<void>((_, reject) => reject('Not implemented'))
  }

  set = (key: string, value: any) => {
    if (isElectron) {
      return electron.ipcRenderer.invoke('setCache', key, value) as Promise<void>
    }
    return new Promise<void>((_, reject) => reject('Not implemented'))
  }
}
