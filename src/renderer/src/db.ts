import Dexie from 'dexie'
import { IPerson } from './interface/IPerson'
import { IGroup } from './interface/IGroup'
import { ISeat } from './interface/ISeat'
import { Seat, SeatState } from './types/seat'
import { Person } from './types/person'
import { Group } from './types/group'
import { SeatHistory } from './types/seatHistory'

export class AppDatabase extends Dexie {
  private static _instance: AppDatabase

  persons!: Dexie.Table<IPerson, number>
  groups!: Dexie.Table<IGroup, number>
  seats!: Dexie.Table<ISeat, number>
  seatMap!: Dexie.Table<SeatState, number>
  seatHistory!: Dexie.Table<SeatHistory, number>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      persons: '++id, name, genderCode, number',
      groups: '++id, name, description, members',
      seats: 'index, owner',
      seatMap: 'index',
      seatHistory: 'timestamp, type'
    })
    this.persons.mapToClass(Person)
    this.groups.mapToClass(Group)
    this.seats.mapToClass(Seat)
    this.seatMap.mapToClass(SeatState)
    this.seatHistory.mapToClass(SeatHistory)
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase._instance) {
      AppDatabase._instance = new AppDatabase()
    }
    return AppDatabase._instance
  }
}

export default AppDatabase.getInstance()
