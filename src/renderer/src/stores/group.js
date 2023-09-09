import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGroupStore = defineStore('group', () => {
  const groups = ref([])
  return { groups }
}, { persist: true })