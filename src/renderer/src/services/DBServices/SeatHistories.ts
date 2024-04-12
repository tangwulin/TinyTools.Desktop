import deepcopy from 'deepcopy'
import db from '../../db'
import { SeatHistory } from '../../types/seatHistory'
import { SeatTableItem } from '../../types/SeatTableItem'
import { DynamicListConfig, getDynamicList } from '../../utils/DBUtil'

export const getDynamicSeatHistoryList = <E>(config?: DynamicListConfig<SeatHistory, E>) =>
  getDynamicList(db.seatHistories, config)

export const getSeatHistoryList = async () => await db.seatHistories.toArray()

export const addSeatHistories = async (seatHistories: SeatHistory[]) =>
  await db.seatHistories.bulkAdd(seatHistories)

export const saveHistory = (currentSeatTable: SeatTableItem[], type: string) => {
  if (type === '手动更改') {
    db.seatHistories
      .orderBy('timestamp')
      .reverse()
      .limit(1)
      .first()
      .then((result) => {
        if (result) {
          if (JSON.stringify(result.seatTable) === JSON.stringify(currentSeatTable)) {
            //未发生变化，无需保存
            return
          }
          //TODO:给每个记录增加子记录而不是直接覆盖
          db.seatHistories
            .orderBy('timestamp')
            .reverse()
            .limit(1)
            .modify((item) => {
              item.seatTable = deepcopy(currentSeatTable)
              item.timestamp = Date.now()
            })
        }
      })
      .catch((e) => {
        console.error(e)
        throw e
      })
  } else {
    db.seatHistories
      .add(deepcopy(new SeatHistory(Date.now(), currentSeatTable, type)))
      .catch((e) => {
        console.error(e)
      })
  }
}
