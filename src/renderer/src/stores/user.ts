import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = reactive({
      name: '李田所',
      id: '114514',
      level: 5,
      exp: 60
    })

    const asset = reactive({
      money: 142470,
      gem: 2800,
      stone: 0,
      sense: 924
    })

    const fightInfo = reactive({
      name: '2-3 无罪推定'
    })

    return {
      user,
      asset,
      fightInfo
    }
  },
  { persist: true }
)
