import { maxBy, shuffle } from 'lodash-es'
import { GenderPreference } from '../enum/GenderPreference'
import { Person } from '../types/person'
import { Seat } from '../types/seat'
import { SeatTableItem } from '../types/SeatTableItem'

// function calcDistance(x: Seat, y: Seat): number
// function calcDistance(x: unknown, y: unknown) {
//   const xIndex = typeof x === 'number' ? x : (x as Seat).locationIndex
//   const yIndex = typeof y === 'number' ? y : (y as Seat).locationIndex
//   const xRow = Math.ceil(xIndex / 8)
//   const yRow = Math.ceil(yIndex / 8)
//   const xCol = xIndex % 8
//   const yCol = yIndex % 8
//   return Math.max(Math.abs(xRow - yRow), Math.abs(xCol - yCol))
// }
//
// const calcWeightByDistance = (distance: number) => {
//   switch (distance) {
//     case 0:
//       return -10
//     case 1:
//       return -5
//     case 2:
//       return -2
//     default:
//       return distance
//   }
// }

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
    ? calcRegionBySeat(olderSeats1.find((x) => x.personId === item.personId) as Seat)
    : 'A' //用来在没有olderSeatTable1的时候，让older1Region不影响regionWeight
  const olderRegion2 = olderSeatTable2
    ? calcRegionBySeat(olderSeats1.find((x) => x.personId === item.personId) as Seat)
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
    //不远离了，这个实测是有严重问题的
    // weight[i] += calcWeightByDistance(calcDistance(originSeats[i], item))

    //在同权重区域内选择一个
    // weight[i] += Math.cos(1.2 * i * Math.PI)
    weight[i] += Math.random()

    //排除原位置
    if (originSeats[i].personId === item.personId) {
      weight[i] -= 100
    }

    //排除上一次坐的位置（如果有）
    if (olderSeatTable1 && olderSeats1[i].personId === item.personId) {
      weight[i] -= 50
    }

    //排除上上次坐的位置（如果有）
    if (olderSeatTable2 && olderSeats2[i].personId === item.personId) {
      weight[i] -= 50
    }

    //区域权重，用于保证区域均衡
    weight[i] += regionWeight[regionScoreMap.get(calcRegionByIndex(i)) as number]
  }
  return weight
}

// export const genWeightSeries = (weights: number[]) =>
//   Array.from({ length: weights.length }, (_, i) => ({ index: i, weight: weights[i] }))

/**
 * 判断两个人的性别是否符合要求
 * @param genderPolicy
 * ’none‘:不限制
 * ’together‘:男女必须坐在一起
 * ’apart‘:男女必须分开坐
 * @param gender1
 * @param gender2
 * @returns {boolean} 是否符合要求
 */
function judgeGenderPreference(
  genderPolicy: GenderPreference,
  gender1: number | undefined | null,
  gender2: number | undefined | null
): boolean {
  if (!gender1 || !gender2) return true
  //有一个人性别不是男或女，那么直接返回true
  if (![1, 2].includes(gender1) || ![1, 2].includes(gender2)) return true

  switch (genderPolicy) {
    case 'none':
      return true
    case 'together':
      return gender1 !== gender2
    case 'apart':
      return gender1 === gender2
    default:
      return true
  }
}

interface PersonAndWeightSeries {
  weightSeries: number[]
  ownerId: number
  gender: number
}

function calcSeatByWeight(
  seatsWeightSeries: PersonAndWeightSeries[],
  allSeat: Seat[],
  options: { genderPreference: GenderPreference }
) {
  const remainStudentIds = seatsWeightSeries.map((x) => x.ownerId) as number[]
  const remainStudents = seatsWeightSeries.slice() as PersonAndWeightSeries[]
  const remainStudents2 = [] as PersonAndWeightSeries[]
  const temp = [] as PersonAndWeightSeries[]
  const result = new Array(allSeat.length).fill(null) as Seat[]

  function beforeNext() {
    remainStudents.push(...remainStudents2)
    remainStudentIds.push(...remainStudents2.map((x) => x.ownerId))
    remainStudents2.length = 0
    temp.length = 0
  }

  function removeSomeoneFromRemainStudents(who: PersonAndWeightSeries | undefined | null) {
    if (!who) return
    const index = remainStudentIds.indexOf(who.ownerId)
    if (index === -1) return
    remainStudentIds.splice(index, 1)
    remainStudents.splice(index, 1)
  }

  function moveSomeoneToRemainStudents2(who: PersonAndWeightSeries | undefined | null) {
    if (!who) return
    remainStudents2.push(who)
    removeSomeoneFromRemainStudents(who)
  }

  function moveSomeoneToTemp(who: PersonAndWeightSeries | undefined | null) {
    if (!who) return
    temp.push(who)
    removeSomeoneFromRemainStudents(who)
  }

  //这里的i是座位的index
  for (let i = 0; i < result.length; i += 2) {
    const bestStudent1 = maxBy(remainStudents, (o) => o?.weightSeries[i])
    if (bestStudent1) moveSomeoneToTemp(bestStudent1)
    const bestStudent2 = maxBy(remainStudents, (o) => o?.weightSeries[i + 1])
    if (bestStudent2) moveSomeoneToTemp(bestStudent2)

    if (!bestStudent2 && bestStudent1) {
      result[i] = allSeat.find((item) => item.personId === bestStudent1?.ownerId) as Seat
      beforeNext()
      continue
    }

    if (!bestStudent1 || !bestStudent2) break

    //如果两个人的性别符合要求，那么就安排他们坐下
    if (judgeGenderPreference(options.genderPreference, bestStudent1.gender, bestStudent2.gender)) {
      result[i] = allSeat.find((item) => item.personId === bestStudent1.ownerId) as Seat
      result[i + 1] = allSeat.find((item) => item.personId === bestStudent2.ownerId) as Seat
      removeSomeoneFromRemainStudents(bestStudent1)
      removeSomeoneFromRemainStudents(bestStudent2)
      beforeNext()
      continue
    }

    //如果两个人的性别不符合要求，则先判断谁的优先级更高，然后再安排
    const flag = bestStudent1.weightSeries[i] > bestStudent2.weightSeries[i + 1]
    if (flag) {
      result[i] = allSeat.find((item) => item.personId === bestStudent1.ownerId) as Seat
      removeSomeoneFromRemainStudents(bestStudent1)
      moveSomeoneToRemainStudents2(bestStudent2)
    } else {
      result[i + 1] = allSeat.find((item) => item.personId === bestStudent2.ownerId) as Seat
      removeSomeoneFromRemainStudents(bestStudent2)
      moveSomeoneToRemainStudents2(bestStudent1)
    }

    do {
      const bestStudent = maxBy(remainStudents, (o) => o.weightSeries[i])
      if (!bestStudent) break
      if (
        judgeGenderPreference(
          options.genderPreference,
          flag ? bestStudent1.gender : bestStudent2.gender,
          bestStudent.gender
        )
      ) {
        result[i + (flag ? 1 : 0)] = allSeat.find(
          (item) => item.personId === bestStudent.ownerId
        ) as Seat
        removeSomeoneFromRemainStudents(bestStudent)
        beforeNext()
        break
      } else {
        //如果性别不符合要求，那么就把这个人先剔除出去
        moveSomeoneToRemainStudents2(bestStudent)
      }
    } while (result[i + (flag ? 1 : 0)] === null)

    //如果还是没有找到符合要求的人，那么就取remainStudents2的第一个
    if (result[i + (flag ? 1 : 0)] === null) {
      const bestStudent = remainStudents2.shift()
      if (!bestStudent) break
      result[i + (flag ? 1 : 0)] = allSeat.find(
        (item) => item.personId === bestStudent.ownerId
      ) as Seat
      beforeNext()
    }
    //别忘了把remainStudents2的人还回去
    beforeNext()
  }

  return result.map((item, index) => ({ ...item, locationIndex: index }))
}

function matchPersonAndWeights(seatsWeights: number[][], allSeat: Seat[], personList: Person[]) {
  const genderMap = new Map<number, number>(personList.map((x) => [x.id as number, x.genderCode]))
  return seatsWeights.map((x, i) => ({
    ownerId: allSeat[i].personId!,
    weightSeries: x,
    gender: genderMap.get(allSeat[i].personId!)!
  }))
}

export const calcNewSeatByCorrectionAlgorithm = (
  personList: Person[],
  options: { genderPreference: GenderPreference },
  originSeatTable: SeatTableItem[],
  olderSeatTable1?: SeatTableItem[] | undefined,
  olderSeatTable2?: SeatTableItem[] | undefined
) => {
  const originSeat = getSeatsFromSeatTable(originSeatTable)
  const seatsWeights = originSeat.map((x) =>
    calcWeightByCorrectionAlgorithm(x, originSeatTable, olderSeatTable1, olderSeatTable2)
  )
  const weightMatches = matchPersonAndWeights(seatsWeights, originSeat, personList)

  const result = calcSeatByWeight(weightMatches, originSeat, options)

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

export const calcNewSeatBySideToMiddleAlgorithm = (
  originSeatTable: SeatTableItem[],
  personList: Person[],
  options: { genderPreference: GenderPreference }
) => {
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

  const weightMatches = matchPersonAndWeights(seatsWeights, allSeat, personList)
  const result = calcSeatByWeight(weightMatches, allSeat, options)

  return updateSeatTable(originSeatTable, result)
}

export const genSeatTable = (seats: Seat[]) => {
  const result: SeatTableItem[] = []
  for (let i = 0; i < seats.length; i++) {
    result.push({ type: 'seat', data: seats[i] })
    if ((i + 1) % 2 === 0 && (i + 1) % 8 !== 0) result.push({ type: 'aisle' })
  }

  if (result.length % 11 !== 0) {
    switch ((11 - (result.length % 11)) % 3) {
      case 1:
        result.push({ type: 'empty' })
        break
      case 2:
        result.push({ type: 'empty' })
        result.push({ type: 'empty' })
        break
    }

    if (result.length % 11 !== 0) {
      const times = Math.floor((11 - (result.length % 11)) / 3)
      for (let i = 0; i < times; i++) {
        result.push({ type: 'aisle' })
        result.push({ type: 'empty' })
        result.push({ type: 'empty' })
      }
    }
  }
  return result.map((item, index) => ({ ...item, locationIndex: index }) as SeatTableItem)
}

export const reGenSeatTable = (seatTable: SeatTableItem[], seats: Seat[]) => {
  const seatTableRemovedMissingPerson = seatTable.map((item) => {
    if (item.type === 'seat') {
      if (seats.every((x) => x.personId !== item.data?.personId)) {
        item = { locationIndex: item.locationIndex, type: 'empty' }
      }
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
        { type: 'empty' },
        { type: 'empty' },
        { type: 'aisle' },
        { type: 'empty' },
        { type: 'empty' },
        { type: 'aisle' },
        { type: 'empty' },
        { type: 'empty' },
        { type: 'aisle' },
        { type: 'empty' },
        { type: 'empty' }
      ] as SeatTableItem[]
      for (let i = 0; i < rowCountToAdd; i++) {
        result.push(...rowTemplate)
      }
    }
    const seatsToAdd = seats.filter((x) =>
      seatTableRemovedMissingPerson.every((y) => y.data?.personId !== x.personId)
    )

    for (const seat of seatsToAdd) {
      const target = result.find((x) => x.type === 'empty')
      if (target) {
        target.type = 'seat'
        target.data = seat
      }
    }
  }
  //理论上需要写一个删除空余座位的逻辑，但是需要最后一行的位置全部为空才能删除，所以暂时不写

  return result.map((item, index) => ({ ...item, locationIndex: index }) as SeatTableItem)
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
    if (item.type === 'seat') item.data = seats.shift() as Seat
  }
  return result.map((item, index) => ({ ...item, locationIndex: index }) as SeatTableItem)
}

//TODO:让真随机计算座位的实现支持权重等特性
export const calcNewSeatByRealRandom = (seatTable: SeatTableItem[]) => {
  const newSeats = shuffle(getSeatsFromSeatTable(seatTable)).map((item, index) => {
    item.locationIndex = index
    return item
  })

  return updateSeatTable(seatTable, newSeats)
}

export const calcNewSeatByAssignMenAndWomenTogetherAlgorithm = (
  seatTable: SeatTableItem[],
  personList: Person[]
) => {
  //分离出男和女
  const males = shuffle(personList.filter((item) => item.genderCode === 1))
  const females = shuffle(personList.filter((item) => item.genderCode === 2))

  //计算能组多少对
  const pairsAmount = Math.min(males.length, females.length)
  const pairs = [] as [number, number][]

  //组队
  for (let i = 0; i < pairsAmount; i++) {
    const thisTimePair = shuffle([males.shift()?.id, females.shift()?.id]) as [number, number]
    pairs.push(thisTimePair)
  }

  //那些没有组上队的人
  const remainPeople = shuffle(
    personList.filter((item) => !pairs.flat().includes(item.id as number))
  )

  //随机挑一个人让TA没有同桌
  let luckyOne = null as Person | null
  if (remainPeople.length % 2 !== 0) {
    luckyOne = remainPeople.shift() as Person
  }

  //把剩下的人组对
  const remainPairs = [] as [number, number][]
  const remainPeopleCount = remainPeople.length
  for (let i = 0; i < remainPeopleCount / 2; i++) {
    remainPairs.push([remainPeople.shift()?.id as number, remainPeople.shift()?.id as number])
  }

  //把最终能够组对的拼起来打乱
  const allPairs = shuffle([...pairs, ...remainPairs])

  /*
   *处理最后一排存在的没有同桌的情况
   *不管三七二十一直接添加最后的那个人可能会导致最后一排的某桌与要求不符
   */
  const lastRow = seatTable.slice(-11).filter((item) => item.type !== 'aisle')
  const lastRowLayout = [] as ('single' | 'double' | 'nobody')[]
  const temp = [] as ('seat' | 'aisle' | 'empty')[]
  for (const item1 of lastRow) {
    temp.push(item1.type)
    if (temp.length > 1) {
      if (temp.every((item) => item === 'seat')) {
        lastRowLayout.push('double')
      } else {
        if (temp.every((item) => item === 'empty')) {
          lastRowLayout.push('nobody')
        } else {
          lastRowLayout.push('single')
        }
      }
      temp.length = 0
    }
  }

  const rowAmount = Math.ceil(seatTable.length / 11)
  const newSeats = allPairs
    .slice(0, 4 * (rowAmount - 1))
    .flat()
    .map(
      (item, index) =>
        new Seat(personList.find((p) => p.id === item)?.name as string, index, undefined, item)
    ) as Seat[]
  allPairs.splice(0, 4 * (rowAmount - 1))
  for (const layout of lastRowLayout) {
    if (layout === 'single') {
      newSeats.push(
        new Seat(
          personList.find((p) => p.id === luckyOne?.id)?.name as string,
          newSeats.length,
          undefined,
          luckyOne?.id
        )
      )
    }
    if (layout === 'double') {
      const thisPair = allPairs.shift() as [number, number]
      const startIndex = newSeats.length
      newSeats.push(
        ...thisPair.map(
          (item, index) =>
            new Seat(
              personList.find((p) => p.id === item)?.name as string,
              startIndex + index,
              undefined,
              item
            )
        )
      )
    }
  }
  return updateSeatTable(seatTable, newSeats)
}
