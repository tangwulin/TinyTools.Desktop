import db from '../../db'
import { Person } from '../../types/person'
import { DynamicListConfig, getDynamicList } from '../../utils/DBUtil'
import { deleteMemberByIdFromAllGroups } from './Group'
import { deleteRateHistoriesByOwnerId } from './RateHistories'
import { deleteSomeoneByIdFromAllSeats } from './SeatTable'

export const getPersonList = async () => await db.persons.toArray()
export const getDynamicPersonList = <E>(config?: DynamicListConfig<Person, E>) =>
  getDynamicList(db.persons, config)

export const getPerson = async (id: number) => await db.persons.get(id)

export const addPerson = async (person: Person) => await db.persons.add(person)
export const addPersons = async (persons: Person[]) => await db.persons.bulkAdd(persons)

export const updatePerson = async (id: number, person: Person) =>
  await db.persons.update(id, person)

// export const updatePersons = async (persons: Person[]) => await db.persons.bulkPut(persons)

// export const deletePersons = async (ids: number[]) => await db.persons.bulkDelete(ids)

export const deletePerson = async (id: number) => {
  //TODO: 拆分成多个事务，放在每个数据库的模块中
  await db.transaction('rw', [db.persons, db.groups, db.seatTable, db.rateHistories], async () => {
    try {
      await deleteRateHistoriesByOwnerId(id)
      await deleteMemberByIdFromAllGroups(id)
      await deleteSomeoneByIdFromAllSeats(id)
      await db.persons.delete(id)
    } catch (e) {
      console.error(e)
    }
  })
}
