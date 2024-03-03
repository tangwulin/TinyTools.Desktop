import Dexie from 'dexie'
import { dbVersion } from './config'
import { CourseTableItem } from './interface/course'
import { Group } from './types/group'
import { Person } from './types/person'
import { Rate } from './types/rate'
import { RateHistory } from './types/rateHistory'
import { SeatHistory } from './types/seatHistory'
import { SeatTableItem } from './types/SeatTableItem'

export class AppDatabase extends Dexie {
  private static _instance: AppDatabase

  persons!: Dexie.Table<Person, number>
  groups!: Dexie.Table<Group, number>
  seatHistories!: Dexie.Table<SeatHistory, number>
  rates!: Dexie.Table<Rate, number>
  rateHistories!: Dexie.Table<RateHistory, number>
  coursesTable!: Dexie.Table<CourseTableItem, number>
  seatTable!: Dexie.Table<SeatTableItem, number>

  constructor() {
    super('AppDatabase')
    this.version(dbVersion).stores({
      persons: '++id, name, genderCode, number',
      groups: '++id, name, description',
      seatHistories: 'timestamp, type',
      rates: '++id, name, description',
      rateHistories: 'timestamp, ownerId',
      coursesTable: '++id',
      seatTable: 'locationIndex, type'
    })
    this.persons.mapToClass(Person)
    this.groups.mapToClass(Group)
    this.seatHistories.mapToClass(SeatHistory)
    this.rates.mapToClass(Rate)
    this.rateHistories.mapToClass(RateHistory)
    this.seatTable.mapToClass(SeatTableItem)
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase._instance) {
      AppDatabase._instance = new AppDatabase()
    }
    return AppDatabase._instance
  }
}

export default AppDatabase.getInstance()
