import { replaceArrayElements } from '@/assets/script/seatHelper.js'
import { shuffle } from 'lodash-es'

self.onmessage = async (event) => {
  const data = event.data
  console.log('接收到主线程的消息:', event.data)
  const stopwatch = performance.now()
  // 执行耗时的任务
  const result = replaceArrayElements(data).map((item, index) => {
    return {
      ...item, index: index, isSeat: false, isDashed: true
    }
  })
  self.postMessage(result)
  console.log(result)
  const x = async () => {
    let series = Array.from({ length: result.length }, (v, i) => i)
    series = shuffle(series)
    for (const x of series)
    {
      await new Promise(resolve => {
        setTimeout(() => {
          result.forEach(item => item.color = null)
          result[x].isDashed = false
          result[x].isSeat = true
          result[x].color = '#43a447'
          // 向主线程发送消息
          self.postMessage(result)
          resolve()
        }, 500)
      })
    }
    result.forEach(item => item.color = null)
    self.postMessage(result)
  }
  setTimeout(() => {x()}, 500)

  console.log('执行完成,用时' + (performance.now() - stopwatch) + 'ms')
}
