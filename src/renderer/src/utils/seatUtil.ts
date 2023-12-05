import { Person } from '../types/person'
import { Seat, SeatState } from '../types/seat'

function calcDistance(x: Seat, y: Seat): number
// function calcDistance(x: number, y: number): number
function calcDistance(x: unknown, y: unknown) {
  const xIndex = typeof x === 'number' ? x : (x as Seat).index
  const yIndex = typeof y === 'number' ? y : (y as Seat).index
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

// const calcWeightByGender = (x: Seat, y: Seat) => (x.owner.genderCode === y.owner.genderCode ? 0 : 1)

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

const calcRegionBySeat = (x: Seat) => calcRegionByIndex(x.index)

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

export const calcWeight = (
  item: Seat,
  allSeat: Seat[],
  oldAllSeat: Seat[],
  oldOldAllSeat?: Seat[]
) => {
  const region = calcRegionBySeat(item)
  const oldRegion = calcRegionBySeat(oldAllSeat?.find((x) => x.owner.id === item.owner.id) as Seat)
  const oldOldRegion = oldOldAllSeat
    ? calcRegionBySeat(oldOldAllSeat?.find((x) => x.owner.id === item.owner.id) as Seat)
    : 'A' //用来在没有oldOldAllSeat的时候，让oldOldRegion不影响regionWeight
  const regionScore = [region, oldRegion, oldOldRegion]
    // const regionScore = [region, oldRegion]
    .map((x) => regionScoreMap.get(x) as number)
    .reduce(function (prev, curr) {
      return prev + curr
    })

  const regionWeight = regionWeightMap.get(regionScore) ?? [0, 0, 0, 0]

  const weight: number[] = []
  for (let i = 0; i < allSeat.length; i++) {
    weight[i] = 0
    weight[i] += calcWeightByDistance(calcDistance(allSeat[i], item))
    if (allSeat[i].owner.id === item.owner.id) {
      weight[i] -= 100
    }
    if (oldAllSeat && oldAllSeat[i].owner.id === item.owner.id) {
      weight[i] -= 50
    }
    if (oldOldAllSeat && oldOldAllSeat[i].owner.id === item.owner.id) {
      weight[i] -= 50
    }
    weight[i] += regionWeight[regionScoreMap.get(calcRegionByIndex(i)) as number]
  }
  return weight
}

export const genWeightSeries = (weights: number[]) =>
  Array.from({ length: weights.length }, (_, i) => ({ index: i, weight: weights[i] }))

export const calcNewSeatByWeight = (
  allSeat: Seat[],
  oldAllSeat: Seat[],
  oldOldAllSeat?: Seat[]
) => {
  const seatsWeights = allSeat.map((x) => calcWeight(x, allSeat, oldAllSeat, oldOldAllSeat))
  const seatsWeightSeries = seatsWeights.map((x, i) => ({
    owner: allSeat[i].owner,
    weightSeries: genWeightSeries(x).sort((a, b) => b.weight - a.weight)
  }))

  const remainStudentIds = seatsWeightSeries.map((x) => x.owner.id) as (number | undefined | null)[]
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
          .find((x) => x.owner.id === studentId)
          ?.weightSeries.find((x) => x.index === i)?.weight ?? -Infinity
      if (currentPriority < bestStudentPriority) continue

      bestStudentId = studentId
      bestStudentPriority = currentPriority
      bestStudentIndex = j
    }

    result[i] = allSeat.find((item) => item.owner.id === bestStudentId) as Seat
    remainStudentIds[bestStudentIndex] = null
  }

  return result.map((item) => {
    const owner = item.owner
    return new Seat(
      new Person(owner.name, owner.genderCode, owner.number, owner?.id, owner?.avatar),
      item.index
    )
  })
}
export const genSeatMap = (seatCount: number) => {
  const result: ('seat' | 'blank' | 'empty')[] = []
  for (let i = 0; i < seatCount; i++) {
    result.push('seat')
    if ((i + 1) % 2 === 0 && (i + 1) % 8 !== 0) result.push('blank')
  }

  if (result.length % 11 !== 0) {
    switch ((11 - (result.length % 11)) % 3) {
      case 1:
        result.push('empty')
        break
      case 2:
        result.push('empty')
        result.push('empty')
        break
    }

    if (result.length % 11 !== 0) {
      const times = Math.floor((11 - (result.length % 11)) / 3)
      for (let i = 0; i < times; i++) {
        result.push('blank')
        result.push('empty')
        result.push('empty')
      }
    }
  }
  return result.map((item, index) => new SeatState(index, item))
}
