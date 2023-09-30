// noinspection JSUnusedGlobalSymbols

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Group } from '../types/group'
// import localforage from 'localforage'
//
// localforage.config({
//   name: 'data'
// })

export const useGroupStore = defineStore(
  'group',
  () => {
    const groups = ref<Group[]>([])
    return { groups }
  }
  // { persist: { storage: localforage } }
)
