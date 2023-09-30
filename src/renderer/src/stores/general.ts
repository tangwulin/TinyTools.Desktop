import { defineStore } from 'pinia'
import { ref } from 'vue'
// import localforage from 'localforage'
//
// localforage.config({
//   name: 'data'
// })

export const useGeneralStore = defineStore(
  'general',
  () => {
    const lastScoreType = ref<string>('person')
    return { lastScoreType }
  }
  // { persist: { storage: localforage } }
)
