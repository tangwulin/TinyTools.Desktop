import musicConfig from '../data/musics.json'
import genUniqueId from './genUniqueId'

const raffleBgm = musicConfig.raffleBgm
const finalBgm = musicConfig.finalBgm

export const getDefaultBgm = () => raffleBgm.map((item) => ({ ...item, uniqueId: genUniqueId() }))

export const getDefaultFinalBgm = () =>
  finalBgm.map((item) => ({ ...item, uniqueId: genUniqueId() }))
