import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useArknightsUIStore = defineStore(
  'arknightUI',
  () => {
    const selectedCharacterKey = ref('char_124_kroos') //当前选中的角色Key

    const selectedCharacterImageIndex = ref(0) //当前选中的立绘索引
    const shouldUseOnlineImage = ref(true) //是否加载在线图片
    const shouldShowFullSizeImage = ref(false) //是否加载原图（仅限在线图片）

    const selectedCharacterVoiceLang = ref('日语') //当前选中的语音语种
    const shouldUseOnlineVoice = ref(true) //是否加载在线语音

    const selectedCharacterDialogLang = ref('中文') //当前选中的对话语种

    const user = reactive({
      name: '李田所',
      id: '114514',
      level: 5,
      exp: 60
    })

    const asset = reactive({
      money: 114514,
      gem: 1919,
      stone: 810,
      sense: 721
    })

    const fightInfo = reactive({
      name: '2-3 无罪推定'
    })

    return {
      selectedCharacterKey,
      selectedCharacterImageIndex,
      shouldUseOnlineImage,
      shouldShowFullSizeImage,
      selectedCharacterVoiceLang,
      shouldUseOnlineVoice,
      selectedCharacterDialogLang,
      user,
      asset,
      fightInfo
    }
  },
  { persist: true }
)
