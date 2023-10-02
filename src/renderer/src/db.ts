import Dexie from 'dexie'
import { IPerson } from './interface/IPerson'
import { IGroup } from './interface/IGroup'
import { ISeat } from './interface/ISeat'
import { Seat, SeatState } from './types/seat'
import { Person } from './types/person'
import { Group } from './types/group'

export class AppDatabase extends Dexie {
  persons!: Dexie.Table<IPerson, number>
  groups!: Dexie.Table<IGroup, number>
  seats!: Dexie.Table<ISeat, number>
  seatMap!: Dexie.Table<SeatState, number>
  seatHistory!: Dexie.Table<
    {
      timestamp: number
      seats: Seat[]
      seatMap: SeatState[]
    }[],
    number
  >

  constructor() {
    super('AppDatabase')
    this.version(2).stores({
      persons: '++id, name, genderCode, number',
      groups: '++id, name, description, members',
      seats: '++id, owner, index',
      seatMap: '++id, state',
      seatHistory: '++id, timestamp'
    })
    this.persons.mapToClass(Person)
    this.groups.mapToClass(Group)
  }
}

export const db = new AppDatabase()
