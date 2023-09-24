import { Person } from './person'

export class Seat {
  owner: Person
  index: number
  location: string = ''

  get displayName() {
    return this.owner.name
  }

  constructor(owner: Person, index: number) {
    this.owner = owner
    this.index = index
  }
}
