import db from '../../db'
import { SeatTableItem } from '../../types/SeatTableItem'

export const deleteSomeoneByIdFromAllSeats = async (ownerId: number) =>
  db.transaction('rw', db.seatTable, async () => {
    await db.seatTable
      .filter((seat) => seat.data?.personId === ownerId)
      .modify((seat) => {
        seat.setEmpty()
      })
  })

export const rewriteWholeSeatTable = async (newSeatTable: SeatTableItem[]) =>
  db.transaction('rw', db.seatTable, async () => {
    await db.seatTable.clear()
    await db.seatTable.bulkAdd(newSeatTable)
  })

export const getSeatTable = async () => db.seatTable.toArray()
