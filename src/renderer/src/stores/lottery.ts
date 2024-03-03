import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Prize } from '../types/prize'

export const useLotteryStore = defineStore('lottery', () => {
  const prizeList = ref<Prize[]>([])
  const prizeHistory = ref<{ name: string; timestamp: number }[]>([])

  return { prizeList, prizeHistory }
})
