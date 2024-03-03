import { Seat } from './seat'

export class SeatTableItem {
  type: 'seat' | 'aisle' | 'empty'
  data?: Seat
  locationIndex?: number

  constructor(type: 'seat' | 'aisle' | 'empty', data?: Seat, locationIndex?: number) {
    this.type = type
    this.data = data
    this.locationIndex = locationIndex
  }
}
