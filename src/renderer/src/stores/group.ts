// noinspection JSUnusedGlobalSymbols

import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { Group } from '../types/group'
import { parse, stringify } from 'zipson'
import { usePersonStore } from './person'
import { Person } from '../types/person'

export const useGroupStore = defineStore(
  'group',
  () => {
    const groups = ref<Group[]>([])
    return { groups }
  },
  {
    persistedState: {
      serialize: (state) => {
        const result = {
          groups: state.groups.map((item) => ({
            ...item,
            members: [...item.members.map((p) => p.uniqueId)]
          }))
        }
        console.log(result)

        return stringify(result)
      },
      deserialize: (persistedState) => {
        const personStore = usePersonStore()
        const { persons } = storeToRefs(personStore)
        console.log(persons.value)
        const data = parse(persistedState) as {
          groups: {
            name: string
            description: string
            members: string[]
            avatar: string
            uniqueId: string
            score: number
          }[]
        }

        return {
          groups: data.groups.map(
            (item) =>
              new Group(item.name, item.description, item.avatar, item.uniqueId, [
                ...persons.value.filter((p) => item.members.includes(p.uniqueId))
              ] as Person[])
          )
        }
      }
    }
  }
)
