import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Seat } from '../types/seat'

export const useSeatStore = defineStore('seat', () => {
  const seats = ref<Seat[]>([])
  const seatMap = ref<('seat' | 'blank' | 'empty')[]>([])
  const history = ref<{ allSeats: Seat[]; seatArrangement: ('seat' | 'blank' | 'empty')[] }>(null)
  return { seats, seatMap, history }
})
