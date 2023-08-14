import { difference, shuffle } from 'lodash-es'

export const getRenderingList = (seat = [], oldRenderingList = [], coloringEdge = false, forceUpdate = false) => {
  let stopwatch = performance.now()
  if (seat.length === 0) return []
  //if (seat.length !== parseRenderingListToSeats(oldRenderingList).length) forceUpdate = true

  let x = [...seat]
  if (coloringEdge)
  {
    x.forEach((item, index) => {
      if (parseEdgeSeatIndex(x.length).find(y => y === index) || index === 0)
      {
        item.color = '#43a447'
      }
      else
      {
        item.color = null
      }
    })
  }

  if (oldRenderingList.length === 0 || forceUpdate) //判断是否为拖动导致的更新
  {
    console.log('Calculation mode')
    console.log(oldRenderingList)
    const result =
      x.map(item => {return { ...item, isSeat: true }})
       .flatMap((value, index) => {
         if ((index + 1) % 2 === 0 && (index + 1) % 8 !== 0)
         {
           return [value, { name: null, isSeat: false }]
         }
         else
         {
           return value
         }
       })
    console.log('convert time:' + (performance.now() - stopwatch) + 'ms')
    stopwatch = performance.now()
    const remaining = 11 - (result.length % 11)

    if (remaining % 3 !== 0)
    {
      for (let i = 0; i < remaining % 3; i++)
      {
        result.push({ name: null, isSeat: false, isDashed: true })
      }
    }

    for (let i = 0; i < (remaining - remaining % 3) / 3; i++)
    {
      result.push({ name: null, isSeat: false }, { name: null, isSeat: false, isDashed: true }, {
        name: null, isSeat: false, isDashed: true
      })
    }
    console.log('add blank time:' + (performance.now() - stopwatch) + 'ms')
    return result
  }
  else
  {
    console.log('Replace mode')
    let i = -1 //这里是为了适配下面的需要
    oldRenderingList = oldRenderingList.map(item => {
      if (item.isSeat)
      {
        i++
        if (x[i].isSeat) return { ...x[i], isSeat: true }
        else return x[i]
      }
      else return item
    })
    console.log('replace time:' + (performance.now() - stopwatch) + 'ms')
    return oldRenderingList
  }
}

export const parseRenderingListToSeats = (x) => {
  return x
    .map(item => {
      if (item.isSeat === true)
      {
        return item
      }
    })
    .filter(item => item !== undefined)
    .map((item, index) => {return { ...item, index: index }})
}

export const parseEdgeSeatIndex = (l) => {
  if (l === 0) return []
  let result = []

  if (l > 1)
  {
    let x = 7
    if (!l > 7) x = l
    for (let i = 1; i < x; i++)
    {
      result.push(i)
    }
  }

  if (Math.floor(l / 8) === 0)
  {
    for (let i = 0; i < l; i++)
    {
      result.push(i)
    }
    return result
  }

  for (let i = 0; i < Math.floor(l / 8); i++)// 左右两侧
  {
    result.push(i * 8, i * 8 + 7)
  }

  for (let i = 0; i < 6; i++)// 最后一个满排
  {
    result.push(l - l % 8 - 7 + i)
  }

  if (l % 8 !== 0)
  {
    for (let i = 1; i <= l % 8; i++)// 真·最后一排
    {
      result.push(l - l % 8 - 1 + i)
    }
  }

  return result
}

export function replaceArrayElements(source)
{
  const sourceArray = [...source]
  const targetArray = []
  const edgeIndexes = parseEdgeSeatIndex(sourceArray.length)
  const allIndexes = Array.from({ length: targetArray.length }, (_, i) => i)
  const notEdgeIndexesArray = difference(allIndexes, edgeIndexes)

  if (sourceArray.length > notEdgeIndexesArray.length) return shuffle(sourceArray)

  const seatsForEdger = shuffle(notEdgeIndexesArray).slice(0, sourceArray.length) //截断为需要的长度

  const positions2 = difference(allIndexes, seatsForEdger) //分配给原来坐犄角旮旯的人剩下的
  const sourceArray2 = notEdgeIndexesArray.map(index => targetArray[index]) //原来那些不坐犄角旮旯的人

  // 逐个替换元素
  seatsForEdger.forEach(position => {
    const sourceIndex = Math.floor(Math.random() * sourceArray.length)
    targetArray[position] = sourceArray[sourceIndex]
    sourceArray.splice(sourceIndex, 1) //把用过的删掉
  })

  positions2.forEach(position => {
    const sourceIndex = Math.floor(Math.random() * sourceArray2.length)
    targetArray[position] = sourceArray[sourceIndex]
    sourceArray2.splice(sourceIndex, 1)
  })

  return targetArray
}