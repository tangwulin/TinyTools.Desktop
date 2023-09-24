import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Audio } from '../types/audio'

export const useSettingStore = defineStore('setting', () => {
  const coloringEdgeSeats = ref<boolean>(false)

  const bgms = ref<Audio[]>([])
  const finalBgms = ref<Audio[]>([])
  const isBGMInitialized = ref<boolean>(false)
  const enableBgm = ref<boolean>(true)
  const enableFinalBgm = ref<boolean>(true)
  const enableFadein = ref<boolean>(true)
  const fadeinTime = ref<number>(3)

  const enableDocking = ref<boolean>(false)

  const enableDevelopFeature = ref<boolean>(false)

  const enableOldToolBar = ref<boolean>(false)

  const lotteryMode = ref<number>(2)

  const isFirstSetup = ref<boolean>(true)

  const enableAvatar = ref<boolean>(true)
  const enableFallbackAvatar = ref<boolean>(true)
  const avatarWorks = ref<number[]>([1, 2, 3])

  return {
    coloringEdgeSeats,
    bgms,
    finalBgms,
    isBGMInitialized,
    enableBgm,
    enableFinalBgm,
    enableFadein,
    fadeinTime,
    enableDocking,
    enableDevelopFeature,
    enableOldToolBar,
    lotteryMode,
    isFirstSetup,
    enableAvatar,
    enableFallbackAvatar,
    avatarWorks
  }
})
