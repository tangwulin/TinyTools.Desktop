import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Group } from '../types/group'

export const useGroupStore = defineStore('group', () => {
  const groups = ref<Group[]>([])
  return { groups }
})
