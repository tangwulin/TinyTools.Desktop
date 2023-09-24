import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGeneralStore = defineStore('general', () => {
  const lastScoreType = ref<string>('person')
  return { lastScoreType }
})
