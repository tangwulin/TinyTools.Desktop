import { IPerson } from '../interface/IPerson'
import { ISeat } from '../interface/ISeat'

export class Seat implements ISeat {
  owner: IPerson
  index: number
  color: string | null | undefined

  constructor(owner: IPerson, index: number, color?: string | null) {
    this.owner = owner
    this.index = index
    this.color = color
  }

  get location() {
    return Math.floor(this.index / 8) + 1 + '排' + ((this.index % 8) + 1) + '座'
  }

  get displayName() {
    return this.owner.name
  }
}

export class SeatState {
  index: number
  state: 'seat' | 'blank' | 'empty'

  constructor(index: number, state: 'seat' | 'blank' | 'empty') {
    this.index = index
    this.state = state
  }
}
