import { Seat, SeatState } from './seat'

export class SeatHistory {
  timestamp: number
  seats: Seat[]
  seatMap: SeatState[]
  type: string

  constructor(seats: Seat[], seatMap: SeatState[], type: string) {
    this.timestamp = Date.now()
    this.seats = seats
    this.seatMap = seatMap
    this.type = type
  }
}
