import type { ElectronAPI } from '@electron-toolkit/preload'
import { createAlova } from 'alova'
import GlobalFetch from 'alova/GlobalFetch'
import VueHook from 'alova/vue'
import characterList from '../data/arknightsCharacterList.json'

import { CharaData } from '../types/CharaData'

type CharaNameAndKey = {
  name: string
  charaKey: string
}

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

const apiInst = createAlova({
  statesHook: VueHook,
  baseURL: isElectron ? await electron.ipcRenderer.invoke('getRendererPath') : undefined,
  requestAdapter: GlobalFetch(),
  responded: (response) => response.json()
})

export const getCharacterInfo = (characterKey: string) =>
  apiInst.Get<CharaData>(`./arknights/${characterKey}.json`)

export const getCharacterList = () => characterList as CharaNameAndKey[]

export const getCharacterKey = (name: string) =>
  characterList.find((c) => c.name === name)?.charaKey

export const getCharacterVoice = async (
  characterKey: string,
  voiceLang: string,
  dialogLang: string
) => {
  return getCharacterInfo(characterKey).then((res) => {
    const voiceBase = `https://torappu.prts.wiki/assets/audio/${res.voiceBase[voiceLang]}`
    return Promise.all(
      res.voiceList
        .map(async (v) => ({
          title: v.title,
          detail: v.text.find((t) => t.language === dialogLang)?.content,
          audio: `${voiceBase}/${v.filename.toLowerCase()}`
        }))
        .map((res) => {
          return res
        })
    )
  })
}

export const getCharacterSupportLanguages = async (characterKey: string) => {
  return getCharacterInfo(characterKey).then((res) => {
    return {
      voice: res.voiceBase.map((item) => item.language),
      dialog: res.voiceList[0].text.map((item) => item.language)
    }
  })
}
