import { SeatTableItem } from './SeatTableItem'

export class SeatHistory {
  timestamp: number
  seatTable: SeatTableItem[]
  type: string

  constructor(timestamp: number, seatTable: SeatTableItem[], type: string) {
    this.timestamp = timestamp
    this.seatTable = seatTable
    this.type = type
  }
}
