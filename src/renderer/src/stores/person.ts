import { ref } from 'vue'
// import { useGroupStore } from './group' // noinspection JSUnusedGlobalSymbols
import { defineStore } from 'pinia'
import { Person } from '../types/person' // noinspection JSUnusedGlobalSymbols

// noinspection JSUnusedGlobalSymbols
export const usePersonStore = defineStore(
  'person',
  () => {
    const persons = ref<Person[]>([])
    return { persons }
  },
  // {
  //   persistedState: {
  //     deserialize: (persistedState) => {
  //       const groupStore = useGroupStore()
  //       const { groups } = storeToRefs(groupStore)
  //
  //       const data = JSON.parse(persistedState) as {
  //         persons: {
  //           name: string
  //           genderCode: 0 | 1 | 2 | 9
  //           number: string
  //           group: string[] //因为储存时确实是这样的，只存uniqueId
  //           uniqueId: string
  //           avatar: string
  //           score: number
  //         }[]
  //       }
  //
  //       return {
  //         persons: data.persons.map(
  //           (item) =>
  //             new Person(item.name, item.genderCode, item.number, item.uniqueId, [
  //               ...groups.value.filter((group) => item.group.includes(group.uniqueId))
  //             ])
  //         )
  //       }
  //     },
  //     serialize: (state) => {
  //       const result = {
  //         persons: state.persons.map((item) => {
  //           return { ...item, group: [...item.group.map((item) => item.uniqueId)] }
  //         })
  //       }
  //
  //       return JSON.stringify(result)
  //     }
  //   }
  // }
    { persist: true }
)
