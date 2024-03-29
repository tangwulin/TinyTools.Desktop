import deepcopy from 'deepcopy'
import { dbVersion, schemaVersion, supportedSchemaVersion } from '../config'
import db from '../db'
import { schemaVersion1 } from '../interface/schema'
import { useSettingStore } from '../stores/setting'
import { addGroups, getGroupList } from './DBServices/Group'
import { addPersons, getPersonList } from './DBServices/Person'
import { addRates, getRateList } from './DBServices/Rate'
import { addSeatHistories, getRateHistoryList } from './DBServices/RateHistories'
import { getSeatHistoryList } from './DBServices/SeatHistories'
import { addSeatTables, getSeatTable } from './DBServices/SeatTable'

// @ts-ignore:2304
const version = __APP_VERSION__ as string
export const getAppData = async () => {
  const timestamp = Date.now()
  const settingsStore = useSettingStore()
  return deepcopy({
    version: {
      schema: schemaVersion, //TODO: schema version
      db: dbVersion, //TODO: db version
      app: version
    },
    timestamp,
    persons: await getPersonList(),
    groups: await getGroupList(),
    seatTable: await getSeatTable(),
    seatHistories: await getSeatHistoryList(),
    rates: await getRateList(),
    rateHistories: await getRateHistoryList(),
    config: {
      coloringEdgeSeats: settingsStore.coloringEdgeSeats,
      bgms: settingsStore.bgms,
      finalBgms: settingsStore.finalBgms,
      isBGMInitialized: settingsStore.isBGMInitialized,
      enableBgm: settingsStore.enableBgm,
      enableFinalBgm: settingsStore.enableFinalBgm,
      enableFadein: settingsStore.enableFadein,
      fadeinTime: settingsStore.fadeinTime,
      enableDocking: settingsStore.enableDocking,
      enableDevelopFeature: settingsStore.enableDevelopFeature,
      enableOldToolBar: settingsStore.enableOldToolBar,
      lotteryMode: settingsStore.lotteryMode,
      isFirstSetup: settingsStore.isFirstSetup,
      enableAvatar: settingsStore.enableAvatar,
      enableFallbackAvatar: settingsStore.enableFallbackAvatar,
      avatarWorks: settingsStore.avatarWorks
    }
  }) as schemaVersion1
}
export const parseJSON = async (json: string) => {
  let data = null as any

  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('不是有效的JSON文件')
  }

  if (!data) {
    throw new Error('不是有效的JSON文件')
  }
  await importData(data)
}

export async function importData(data: any) {
  if (!data.version || !data.version.schema || !data.version.app) {
    throw new Error('不是有效的TinyTools数据文件')
  }

  if (!supportedSchemaVersion.includes(data.version.schema)) {
    throw new Error('不支持的数据文件版本')
  }

  await db.open()
  await db.delete()
  await db.open()

  if (data.persons && Array.isArray(data.persons)) {
    await addPersons(data.persons)
  } else {
    throw new Error('数据文件中没有人员信息或者人员信息格式错误')
  }

  if (data.groups && Array.isArray(data.groups)) {
    await addGroups(data.groups)
  } else {
    throw new Error('数据文件中没有组信息或者组信息格式错误')
  }

  if (data.seatTable && Array.isArray(data.seatTable)) {
    await addSeatTables(data.seatTable)
  } else {
    throw new Error('数据文件中没有座位表信息或者座位表信息格式错误')
  }

  if (data.seatHistories && Array.isArray(data.seatHistories)) {
    await addSeatHistories(data.seatHistories)
  } else {
    throw new Error('数据文件中没有座位历史信息或者座位历史信息格式错误')
  }

  if (data.rates && Array.isArray(data.rates)) {
    await addRates(data.rates)
  } else {
    throw new Error('数据文件中没有评分项信息或者评分项信息格式错误')
  }

  if (data.rateHistories && Array.isArray(data.rateHistories)) {
    await addSeatHistories(data.rateHistories)
  } else {
    throw new Error('数据文件中没有评分历史信息或者评分历史信息格式错误')
  }
}
