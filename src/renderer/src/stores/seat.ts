import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Seat } from '../types/seat'

// noinspection JSUnusedGlobalSymbols
export const useSeatStore = defineStore(
  'seat',
  () => {
    const seats = ref<Seat[]>([])
    const seatMap = ref<('seat' | 'blank' | 'empty')[]>([])
    const history = ref<
      {
        seats: Seat[]
        seatMap: ('seat' | 'blank' | 'empty')[]
      }[]
    >([])
    return { seats, seatMap, history }
  },
  // {
  //   persistedState: {
  //     //不要问为什么这么麻烦，不这样做getter会失效
  //     deserialize: (persistedState) => {
  //       const result = parse(persistedState) as {
  //         seats: { index: number; location: string; owner: { uniqueId: string } }[]
  //         seatMap: ('seat' | 'blank' | 'empty')[]
  //         history: {
  //           seats: Seat[]
  //           seatMap: ('seat' | 'blank' | 'empty')[]
  //         }
  //       }
  //
  //       const personStore = usePersonStore()
  //       const { persons } = storeToRefs(personStore)
  //
  //       result.seats = result.seats.map((seat) => {
  //         return new Seat(
  //           (persons.value.find((person) => person.uniqueId === seat.owner.uniqueId) as Person) ??
  //             new Person('???', 9, ''),
  //           seat.index
  //         )
  //       }) as Seat[]
  //
  //       return result
  //     },
  //     serialize: (state) => {
  //       const result = {
  //         ...state,
  //         seats: state.seats.map((item) => {
  //           return { ...item, owner: { uniqueId: item.owner.uniqueId } }
  //         })
  //       }
  //       return stringify(result)
  //     }
  //   }
  // }
  { persist: true }
)
