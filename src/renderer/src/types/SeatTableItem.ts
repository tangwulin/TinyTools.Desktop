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

  setSeat(seat: Seat) {
    this.type = 'seat'
    this.data = seat
  }

  setAisle() {
    this.type = 'aisle'
    this.data = undefined
  }

  setEmpty() {
    this.type = 'empty'
    this.data = undefined
  }

  setColor(color: string) {
    if (this.data) {
      this.data.color = color
    }
  }

  removeColor() {
    if (this.data) {
      this.data.color = null
    }
  }

  setDisplayName(displayName: string) {
    if (this.data) {
      this.data.displayName = displayName
    }
  }
}
