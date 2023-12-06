import Dexie from 'dexie'
import { CourseTableItem } from './interface/course'
import { Group } from './types/group'
import { Person } from './types/person'
import { Rate } from './types/rate'
import { ScoreHistory } from './types/scoreHistory'
import { Seat, SeatState } from './types/seat'
import { SeatHistory } from './types/seatHistory'

export class AppDatabase extends Dexie {
  private static _instance: AppDatabase

  persons!: Dexie.Table<Person, number>
  groups!: Dexie.Table<Group, number>
  seats!: Dexie.Table<Seat, number>
  seatMap!: Dexie.Table<SeatState, number>
  seatHistory!: Dexie.Table<SeatHistory, number>
  rates!: Dexie.Table<Rate, number>
  scoreHistories!: Dexie.Table<ScoreHistory, number>
  coursesTable!: Dexie.Table<CourseTableItem, number>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      persons: '++id, name, genderCode, number',
      groups: '++id, name, description, members',
      seats: 'index, owner',
      seatMap: 'index',
      seatHistory: 'timestamp, type',
      rates: '++id, name, description',
      scoreHistories: 'timestamp, ownerId',
      coursesTable: '++id'
    })
    this.persons.mapToClass(Person)
    this.groups.mapToClass(Group)
    this.seats.mapToClass(Seat)
    this.seatMap.mapToClass(SeatState)
    this.seatHistory.mapToClass(SeatHistory)
    this.rates.mapToClass(Rate)
    this.scoreHistories.mapToClass(ScoreHistory)
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase._instance) {
      AppDatabase._instance = new AppDatabase()
    }
    return AppDatabase._instance
  }
}

export default AppDatabase.getInstance()
