import db from '../../db'
import { SeatTableItem } from '../../types/SeatTableItem'

export const deleteSomeoneByIdFromAllSeats = async (ownerId: number) =>
  db.transaction('rw', db.seatTable, async () => {
    await db.seatTable
      .filter((seat) => seat.data?.personId === ownerId)
      .modify((seat) => {
        seat.type = 'empty'
        seat.data = undefined
      })
  })

export const rewriteWholeSeatTable = async (newSeatTable: SeatTableItem[]) =>
  db.transaction('rw', db.seatTable, async () => {
    await db.seatTable.clear()
    await db.seatTable.bulkAdd(newSeatTable)
  })

export const getSeatTable = async () => await db.seatTable.toArray()

export const addSeatTable = async (seatTable: SeatTableItem) => await db.seatTable.add(seatTable)
export const addSeatTables = async (seatTables: SeatTableItem[]) => await db.seatTable.bulkAdd(seatTables)
