import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Person } from '../types/person' // import localforage from 'localforage'
// import localforage from 'localforage'
//
// localforage.config({
//   name: 'data'
// })
//
// const storage1 = {
//   getItem: (key: string) => {
//     return localforage.getItem(key)
//   },
//   setItem: (key: string, value: string) => {
//     return localStorage.setItem(key, value)
//   }
// }

export const usePersonStore = defineStore(
  'person',
  () => {
    const persons = ref<Person[]>([])
    return { persons }
  },
  {
    persistedState: {
      deserialize: (persistedState) => {
        const result = JSON.parse(persistedState) as { persons: Person[] }

        result.persons = result.persons.map(
          (item) => new Person(item.name, item.genderCode, item.number, item.uniqueId)
        )
        return result
      }
    }
  }
)
