import { Seat } from '../types/seat'
import { SeatTableItem } from '../types/SeatTableItem'

function calcDistance(x: Seat, y: Seat): number
function calcDistance(x: unknown, y: unknown) {
  const xIndex = typeof x === 'number' ? x : (x as Seat).locationIndex
  const yIndex = typeof y === 'number' ? y : (y as Seat).locationIndex
  const xRow = Math.ceil(xIndex / 8)
  const yRow = Math.ceil(yIndex / 8)
  const xCol = xIndex % 8
  const yCol = yIndex % 8
  return Math.max(Math.abs(xRow - yRow), Math.abs(xCol - yCol))
}

const calcWeightByDistance = (distance: number) => {
  switch (distance) {
    case 0:
      return -10
    case 1:
      return -5
    case 2:
      return -2
    default:
      return distance * 2
  }
}

// const calcWeightByGender = (x: OldSeat, y: OldSeat) => (x.owner.genderCode === y.owner.genderCode ? 0 : 1)

const region = new Map<number, string>([
  [0, 'D'],
  [1, 'D'],
  [2, 'A'],
  [3, 'A'],
  [4, 'A'],
  [5, 'A'],
  [6, 'D'],
  [7, 'D'],
  [8, 'D'],
  [9, 'D'],
  [10, 'A'],
  [11, 'A'],
  [12, 'A'],
  [13, 'A'],
  [14, 'D'],
  [15, 'D'],
  [16, 'D'],
  [17, 'D'],
  [18, 'A'],
  [19, 'A'],
  [20, 'A'],
  [21, 'A'],
  [22, 'D'],
  [23, 'D'],
  [24, 'D'],
  [25, 'D'],
  [26, 'B'],
  [27, 'B'],
  [28, 'B'],
  [29, 'B'],
  [30, 'D'],
  [31, 'D'],
  [32, 'C'],
  [33, 'C'],
  [34, 'B'],
  [35, 'B'],
  [36, 'B'],
  [37, 'B'],
  [38, 'C'],
  [39, 'C']
])

const regionScoreMap = new Map<string, number>([
  ['A', 0],
  ['B', 1],
  ['C', 2],
  ['D', 3]
])

const calcRegionByIndex = (index: number) => {
  if (region.has(index)) {
    return region.get(index) as string
  } else {
    return 'C'
  }
}

const calcRegionBySeat = (x: Seat) => calcRegionByIndex(x.locationIndex)

const regionWeightMap = new Map<number, number[]>([
  [0, [0, 0, 2, 2]],
  [1, [0, 0, 1, 1]],
  [2, [0, 1, 1, 0]],
  [3, [0, 0, 0, 0]],
  [4, [3, 3, -1, -1]],
  [5, [3, 3, -1, -2]],
  [6, [4, 4, -1, -2]],
  [7, [5, 4, -2, -3]],
  [8, [5, 4, -3, -3]],
  [9, [6, 5, -3, -3]]
])

export const calcWeightByCorrectionAlgorithm = (
  item: Seat,
  originSeatTable: SeatTableItem[],
  olderSeatTable1?: SeatTableItem[],
  olderSeatTable2?: SeatTableItem[]
) => {
  const originSeats = getSeatsFromSeatTable(originSeatTable)
  let olderSeats1 = [] as Seat[]
  let olderSeats2 = [] as Seat[]

  if (olderSeatTable1) {
    olderSeats1 = getSeatsFromSeatTable(olderSeatTable1)
  }
  if (olderSeatTable2) {
    olderSeats2 = getSeatsFromSeatTable(olderSeatTable2)
  }

  const originRegion = calcRegionBySeat(item)
  const olderRegion1 = olderSeatTable1
    ? calcRegionBySeat(olderSeats1.find((x) => x.ownerId === item.ownerId) as Seat)
    : 'A' //用来在没有olderSeatTable1的时候，让older1Region不影响regionWeight
  const olderRegion2 = olderSeatTable2
    ? calcRegionBySeat(olderSeats1.find((x) => x.ownerId === item.ownerId) as Seat)
    : 'A' //同上不解释

  const regionScore = [originRegion, olderRegion1, olderRegion2]
    .map((x) => regionScoreMap.get(x) as number)
    .reduce(function (prev, curr) {
      return prev + curr
    })

  const regionWeight = regionWeightMap.get(regionScore) ?? [0, 0, 0, 0]

  const weight: number[] = []
  for (let i = 0; i < originSeats.length; i++) {
    //所有位置初始权重为0
    weight[i] = 0

    //远离原位置
    weight[i] += calcWeightByDistance(calcDistance(originSeats[i], item))

    //排除原位置
    if (originSeats[i].ownerId === item.ownerId) {
      weight[i] -= 100
    }

    //排除上一次坐的位置（如果有）
    if (olderSeatTable1 && olderSeats1[i].ownerId === item.ownerId) {
      weight[i] -= 50
    }

    //排除上上次坐的位置（如果有）
    if (olderSeatTable2 && olderSeats2[i].ownerId === item.ownerId) {
      weight[i] -= 50
    }

    //区域权重，用于保证区域均衡
    weight[i] += regionWeight[regionScoreMap.get(calcRegionByIndex(i)) as number]
  }
  return weight
}

export const genWeightSeries = (weights: number[]) =>
  Array.from({ length: weights.length }, (_, i) => ({ index: i, weight: weights[i] }))

function calcSeatByWeight(
  seatsWeightSeries: { weightSeries: { index: number; weight: number }[]; ownerId: number }[],
  allSeat: Seat[]
) {
  const remainStudentIds = seatsWeightSeries.map((x) => x.ownerId) as (number | undefined | null)[]
  const result = new Array(allSeat.length).fill(null) as Seat[]
  for (let i = 0; i < result.length; i++) {
    let bestStudentId: number | null = null
    let bestStudentPriority = -Infinity
    let bestStudentIndex = -1
    for (let j = remainStudentIds.length; j >= 0; j--) {
      const studentId = remainStudentIds[j]
      if (!studentId) continue

      const currentPriority =
        seatsWeightSeries
          .find((x) => x.ownerId === studentId)
          ?.weightSeries.find((x) => x.index === i)?.weight ?? -Infinity
      if (currentPriority < bestStudentPriority) continue

      bestStudentId = studentId
      bestStudentPriority = currentPriority
      bestStudentIndex = j
    }

    result[i] = allSeat.find((item) => item.ownerId === bestStudentId) as Seat
    remainStudentIds[bestStudentIndex] = null
  }
  return result
}

function getWeightSeries(seatsWeights: number[][], allSeat: Seat[]) {
  return seatsWeights.map((x, i) => ({
    ownerId: allSeat[i].ownerId as number,
    weightSeries: genWeightSeries(x).sort((a, b) => b.weight - a.weight)
  }))
}

export const calcNewSeatByCorrectionAlgorithm = (
  originSeatTable: SeatTableItem[],
  olderSeatTable1?: SeatTableItem[] | undefined,
  olderSeatTable2?: SeatTableItem[] | undefined
) => {
  const originSeat = getSeatsFromSeatTable(originSeatTable)
  const seatsWeights = originSeat.map((x) =>
    calcWeightByCorrectionAlgorithm(x, originSeatTable, olderSeatTable1, olderSeatTable2)
  )
  const seatsWeightSeries = getWeightSeries(seatsWeights, originSeat)

  const result = calcSeatByWeight(seatsWeightSeries, originSeat)

  return updateSeatTable(originSeatTable, result)
}
const calcBigGroup = (index: number) => {
  switch ((index + 1) % 8) {
    case 1:
    case 2:
      return 1
    case 3:
    case 4:
      return 2
    case 5:
    case 6:
      return 3
    case 7:
    case 0:
      return 4
    default:
      throw new Error('calcBigGroup error')
  }
}

export const calcNewSeatByOutsideToInsideAlgorithm = (originSeatTable: SeatTableItem[]) => {
  const allSeat = getSeatsFromSeatTable(originSeatTable)
  const seatsWeights = allSeat.map((x) => {
    const bigGroup = calcBigGroup(x.locationIndex)
    switch (bigGroup) {
      case 1:
      case 4:
        return new Array(allSeat.length).fill(0).map((_, i) => {
          switch (calcBigGroup(i)) {
            case 2:
            case 3:
              return 100 * Math.random()
            case 1:
            case 4:
              return -100
            default:
              return 0
          }
        })
      case 2:
      case 3:
        return new Array(allSeat.length).fill(0).map((_, i) => {
          switch (calcBigGroup(i)) {
            case 1:
            case 4:
              return 100 * Math.random()
            case 2:
            case 3:
              return -100
            default:
              return 0
          }
        })
    }
  })

  const seatsWeightSeries = getWeightSeries(seatsWeights, allSeat)
  const result = calcSeatByWeight(seatsWeightSeries, allSeat)

  return updateSeatTable(originSeatTable, result)
}

export const genSeatTable = (seats: Seat[]) => {
  const result: SeatTableItem[] = []
  for (let i = 0; i < seats.length; i++) {
    result.push(new SeatTableItem('seat', seats[i]))
    if ((i + 1) % 2 === 0 && (i + 1) % 8 !== 0) result.push(new SeatTableItem('aisle'))
  }

  if (result.length % 11 !== 0) {
    switch ((11 - (result.length % 11)) % 3) {
      case 1:
        result.push(new SeatTableItem('empty'))
        break
      case 2:
        result.push(new SeatTableItem('empty'))
        result.push(new SeatTableItem('empty'))
        break
    }

    if (result.length % 11 !== 0) {
      const times = Math.floor((11 - (result.length % 11)) / 3)
      for (let i = 0; i < times; i++) {
        result.push(new SeatTableItem('aisle'))
        result.push(new SeatTableItem('empty'))
        result.push(new SeatTableItem('empty'))
      }
    }
  }
  return result.map((item, index) => new SeatTableItem(item.type, item.data, index))
}

export const reGenSeatTable = (seatTable: SeatTableItem[], seats: Seat[]) => {
  const seatTableRemovedMissingPerson = seatTable.map((item) => {
    if (item.type === 'seat') {
      if (seats.every((x) => x.ownerId !== item.data?.ownerId)) item.setEmpty()
    }
    return item
  })
  const seatsCountInTable = seatTableRemovedMissingPerson.filter((x) => x.type === 'seat').length
  const emptyCountInTable = seatTableRemovedMissingPerson.filter((x) => x.type === 'empty').length
  const seatsCountInSeats = seats.length
  const result = [...seatTableRemovedMissingPerson]

  //判断是否需要添加座位
  if (seatsCountInSeats > seatsCountInTable) {
    const seatCountForAdd = seatsCountInSeats - seatsCountInTable
    //判断是否可以直接添加座位到空位
    if (seatCountForAdd <= emptyCountInTable) {
      /* do nothing */
    } else {
      //需要添加的座位数量大于空位数量，需要添加新行
      const rowCountToAdd = Math.ceil((seatCountForAdd - emptyCountInTable) / 8)
      const rowTemplate = [
        new SeatTableItem('empty'),
        new SeatTableItem('empty'),
        new SeatTableItem('aisle'),
        new SeatTableItem('empty'),
        new SeatTableItem('empty'),
        new SeatTableItem('aisle'),
        new SeatTableItem('empty'),
        new SeatTableItem('empty'),
        new SeatTableItem('aisle'),
        new SeatTableItem('empty'),
        new SeatTableItem('empty')
      ]
      for (let i = 0; i < rowCountToAdd; i++) {
        result.push(...rowTemplate)
      }
    }
    const seatsToAdd = seats.filter((x) =>
      seatTableRemovedMissingPerson.every((y) => y.data?.ownerId !== x.ownerId)
    )

    for (const seat of seatsToAdd) {
      result.find((x) => x.type === 'empty')?.setSeat(seat)
    }
  }
  //理论上需要写一个删除空余座位的逻辑，但是需要最后一行的位置全部为空才能删除，所以暂时不写
  //TODO: 删除空余座位的逻辑

  return result.map((item, index) => new SeatTableItem(item.type, item.data, index))
}

export const getSeatsFromSeatTable = (seatTable: SeatTableItem[]) => {
  return seatTable.filter((x) => x.type === 'seat').map((x) => x.data as Seat)
}

export const updateSeatTable = (seatTable: SeatTableItem[], seats: Seat[]) => {
  const result = [...seatTable]
  const seatsCountInTable = getSeatsFromSeatTable(seatTable).length
  const seatsCountInSeats = seats.length
  if (seatsCountInTable !== seatsCountInSeats)
    throw new Error('updateSeatTable error: seatsCountInTable !== seatsCountInSeats')
  for (const item of result) {
    if (item.type === 'seat') item.setSeat(seats.shift() as Seat)
  }
  return result.map((item, index) => new SeatTableItem(item.type, item.data, index))
}
