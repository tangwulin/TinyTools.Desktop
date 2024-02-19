import db from '../../db'
import { Rate } from '../../types/rate'
import { DynamicListConfig, getDynamicList } from '../../utils/DBUtil'

export const getRateList = async () => await db.rates.toArray()
export const getDynamicRateList = <E>(config?: DynamicListConfig<Rate, E>) =>
  getDynamicList(db.rates, config)

export const addRate = async (rate: Rate) => await db.rates.add(rate)

export const updateRate = async (id: number, rate: Rate) => await db.rates.update(id, rate)
export const getRate = async (id: number) => await db.rates.get(id)
export const getScoreHistoryList = async () => await db.rateHistories.toArray()
