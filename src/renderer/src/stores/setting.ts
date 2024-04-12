import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GenderPreference } from '../enum/GenderPreference'
import { schemaVersion2 } from '../interface/schema'
import { Audio } from '../types/audio'

export const useSettingStore = defineStore(
  'setting',
  () => {
    // const coloringEdgeSeats = ref<boolean>(false)
    //TODO:把bgm配置移到db里
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

    const lotteryMode = ref<number>(4)
    const genderPreference = ref<GenderPreference>(GenderPreference.None)

    const isFirstSetup = ref<boolean>(true)

    const enableAvatar = ref<boolean>(true)
    const enableFallbackAvatar = ref<boolean>(true)
    const avatarWorks = ref<number[]>([1, 2, 3])

    function updateSettings(config: schemaVersion2['config']) {
      // coloringEdgeSeats.value = config.coloringEdgeSeats
      bgms.value = config.bgms
      finalBgms.value = config.finalBgms
      isBGMInitialized.value = config.isBGMInitialized
      enableBgm.value = config.enableBgm
      enableFinalBgm.value = config.enableFinalBgm
      enableFadein.value = config.enableFadein
      fadeinTime.value = config.fadeinTime
      enableDocking.value = config.enableDocking
      enableDevelopFeature.value = config.enableDevelopFeature
      enableOldToolBar.value = config.enableOldToolBar
      lotteryMode.value = config.lotteryMode
      isFirstSetup.value = config.isFirstSetup
      enableAvatar.value = config.enableAvatar
      enableFallbackAvatar.value = config.enableFallbackAvatar
      avatarWorks.value = config.avatarWorks
    }

    return {
      // coloringEdgeSeats,
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
      genderPreference,
      isFirstSetup,
      enableAvatar,
      enableFallbackAvatar,
      avatarWorks,
      updateSettings
    }
  },
  { persist: true }
)
