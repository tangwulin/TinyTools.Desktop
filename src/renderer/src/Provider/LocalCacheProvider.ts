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
  get = async (key: string) => {
    if (isElectron) {
      return (await electron.ipcRenderer.invoke('getCache', key)) as Promise<string | undefined>
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
