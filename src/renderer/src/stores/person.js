import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePersonStore = defineStore(
  'person',
  () => {
    const allPerson = ref([])
    const personList = ref([])
    return { allPerson, personList }
  },
  {
    persist: true,
  },
)
