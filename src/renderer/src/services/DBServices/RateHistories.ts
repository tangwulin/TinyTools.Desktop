import db from '../../db'
import { RateHistory } from '../../types/rateHistory'
import { DynamicListConfig, getDynamicList } from '../../utils/DBUtil'

export const getRateHistoryList = async () => await db.rateHistories.toArray()

export const getRateHistory = async (id: number) => await db.rateHistories.get(id)

export const addRateHistories = async (rateHistories: RateHistory[]) =>
  await db.rateHistories.bulkAdd(rateHistories)

/**
 * 删除指定 ownerId 的所有 rateHistories
 * (外层事务需要将db.rateHistories加入作用域)
 * @param ownerId
 */
export const deleteRateHistoriesByOwnerId = async (ownerId: number) =>
  db.transaction('rw', [db.rateHistories], async () => {
    await db.rateHistories.where({ ownerId }).delete()
  })

export const getDynamicRateHistoriesList = <E>(config?: DynamicListConfig<RateHistory, E>) =>
  getDynamicList(db.rateHistories, config)
