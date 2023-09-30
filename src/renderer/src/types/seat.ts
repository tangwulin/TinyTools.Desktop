import { Person } from './person'

export class Seat {
  owner: Person
  index: number

  get location() {
    return Math.floor(this.index / 8) + 1 + '排' + ((this.index % 8) + 1) + '座'
  }
  get displayName() {
    return this.owner.name
  }

  constructor(owner: Person, index: number) {
    this.owner = owner
    this.index = index
  }
}
