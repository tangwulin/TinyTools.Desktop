import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Person } from '../types/person'

export const usePersonStore = defineStore('person', () => {
  const personList = ref<Person[]>([])
  return { personList }
})
