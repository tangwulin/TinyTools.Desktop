import { Seat, SeatState } from './seat'

export class SeatHistory {
  timestamp: number
  seats: Seat[]
  seatMap: SeatState[]
  constructor(seats: Seat[], seatMap: SeatState[]) {
    this.timestamp = Date.now()
    this.seats = seats
    this.seatMap = seatMap
  }
}
