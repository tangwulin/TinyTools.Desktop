import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Person } from '../types/person'

// noinspection JSUnusedGlobalSymbols
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
      },
      serialize: (state) => {
        const result = {
          persons: state.persons.map((item) => {
            return { ...item, group: [...item.group.map((item) => item.uniqueId)] }
          })
        }
        console.log(result)
        console.log(state)

        return JSON.stringify(state)
      }
    }
  }
)
