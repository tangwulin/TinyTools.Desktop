<script lang="ts" setup>
import { from, useObservable } from '@vueuse/rxjs'
import deepcopy from 'deepcopy'
import { liveQuery } from 'dexie'
import { debounce, shuffle } from 'lodash-es'
import { domToPng } from 'modern-screenshot'
import { MessageReactive, useMessage } from 'naive-ui'
import { Ref, ref } from 'vue'
import SeatTable from '../../../components/SeatTable.vue'
import { AppDatabase } from '../../../db'
import { Person } from '../../../types/person'
import { Seat, SeatState } from '../../../types/seat'
import { SeatHistory } from '../../../types/seatHistory'
import { calcNewSeatByWeight } from '../../../utils/seatUtil'

const db = AppDatabase.getInstance()

const message = useMessage()

const persons = ref([] as Person[])
const seats = ref([] as Seat[])
const seatMap = ref([] as SeatState[])
const seatHistory = useObservable(from(liveQuery(() => db.seatHistory.toArray()))) as Readonly<
  Ref<SeatHistory[]>
>

const currentDate = ref('')
const currentTime = ref('')

const reverse = ref(false)
const loading = ref(false)
const showHasDiffModal = ref(false)

const personsPromise = db.persons.toArray().then((result) => {
  persons.value = result as Person[]
})

const seatsPromise = db.seats.toArray().then((result) => {
  seats.value = result.map(
    (item) => new Seat(persons.value.find((p) => p.id === item.owner.id) ?? item.owner, item.index)
  ) as Seat[]
})

const seatMapPromise = db.seatMap.toArray().then((result) => {
  seatMap.value = result
})

Promise.all([personsPromise, seatsPromise, seatMapPromise]).then(() => {
  if (persons.value.length !== seats.value.length) {
    console.log(persons.value.length, seats.value.length)
    console.log('人数和座位数不一致')
    if (seats.value.length === 0) {
      seats.value = persons.value.map((item, index) => new Seat(item, index))
      db.seats.bulkPut(deepcopy(seats.value))
      const newSeatMap = genSeatMap(seats.value.length)
      seatMap.value = newSeatMap
      db.seatMap.bulkPut(newSeatMap)
      saveHistory(seats.value, newSeatMap, '初始座位')
    } else {
      setTimeout(() => {
        showHasDiffModal.value = true
        console.log('showHasDiffModal', showHasDiffModal.value)
      }, 100)
      showHasDiffModal.value = true
    }
  }
})

const genSeatMap = (seatCount: number) => {
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

    if (result.length % 11 !== 0)
      for (let i = 0; i < Math.floor((11 - (result.length % 11)) / 3); i++) {
        result.push('blank')
        result.push('empty')
        result.push('empty')
      }
  }
  return result.map((item, index) => new SeatState(index, item))
  // return result.slice(0, result.length - 3).map((item, index) => new SeatState(index, item)) //这里故意去掉了最后三个空位，因为上面的代码似乎有问题
}

const raffleSeatImmediately = (result: Seat[]) => {
  seats.value = result
  db.seats.bulkPut(deepcopy(result))
  message.success('抽选完成')
}

const saveHistory = (currentSeat: Seat[], currentSeatMap: SeatState[], type: string) => {
  if (type === '初始座位') {
    db.seatHistory
      .orderBy('timestamp')
      .reverse()
      .limit(1)
      .first()
      .then((result) => {
        if (result) {
          if (
            JSON.stringify(result.seats) === JSON.stringify(currentSeat) &&
            JSON.stringify(result.seatMap) === JSON.stringify(currentSeatMap)
          ) {
            //未发生变化，无需保存
            return
          }
          db.seatHistory.delete(result.timestamp)
        }
      })
  }
  db.seatHistory.add(deepcopy(new SeatHistory(currentSeat, currentSeatMap, type)))
  message.success('已保存本次记录')
}

const handler = (type: 1 | 2 | 3 | 4) => {
  let result = [] as Seat[]
  switch (type) {
    case 1:
      result = shuffle(seats.value).map((item, index) => new Seat(item.owner, index))
      break
    case 2:
      message.error('尚未实现')
      break
    case 3:
      message.error('尚未实现')
      break
    case 4:
      result = calcNewSeatByWeight(
        seats.value,
        (seatHistory.value as SeatHistory[])[0]?.seats ?? seats.value
      )
      break
    default:
      message.error('抽选模式异常')
      break
  }

  if (result.length === 0) return

  raffleSeatImmediately(result)
}

const save = async () => {
  loading.value = true
  let msgReactive = message.create('正在生成图片……', {
    type: 'loading',
    duration: 0
  }) as MessageReactive | null

  const target = document.getElementById('target-div')
  if (!target) return
  const options = {
    filter: (node) => {
      try {
        return !node.classList.contains('border-dashed')
      } catch {
        return true
      }
    },
    backgroundColor: '#FFFFFF',
    scale: 3840 / target.clientWidth //统一保存为4K分辨率
  }
  // scale.value = x;
  domToPng(target, options)
    .then((dataUrl) => {
      const link = document.createElement('a')
      link.download = 'seat-' + currentDate.value + '-' + currentTime.value + '.png'
      link.href = dataUrl
      link.click()
    })
    .then(() => {
      if (!msgReactive) return
      msgReactive.content = '图片生成成功'
      msgReactive.type = 'success'
      loading.value = false
      setTimeout(() => {
        msgReactive?.destroy()
        msgReactive = null
      }, 3000)
    })
}

const dragHandler = debounce(
  () => {
    db.seats.bulkPut(deepcopy(seats.value))
    db.seatMap.bulkPut(deepcopy(seatMap.value))
    saveHistory(seats.value, seatMap.value, '初始座位')
  },
  100,
  {
    maxWait: 2000
  }
)
</script>

<template>
  <div
    id="SeatView"
    class="flex items-center justify-start flex-col h-auto m-auto"
    style="height: 100%"
  >
    <!--  座位表展示区域  <-->
    <div id="target-div" style="margin: 0 auto; padding: 1rem 0; width: 80%">
      <div>
        <SeatTable
          v-model:seat-map="seatMap"
          v-model:seats="seats"
          :disable="loading"
          :reverse="reverse"
          @dragend="dragHandler"
        />
      </div>
      <div class="flex justify-center mt-4" style="font-size: 1rem">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>

    <!--  下方操作按钮区域  <-->
    <div style="display: flex; flex-direction: column">
      <n-space class="mt-2 flex flex-col justify-center items-center">
        <n-button :disabled="loading" @click="handler(1)">重抽座位</n-button>
        <n-button :disabled="loading" @click="save">保存图片</n-button>
        <n-switch v-model:value="reverse">
          <template #checked> 老师视角</template>
          <template #unchecked> 学生视角</template>
        </n-switch>
      </n-space>
      <!--      <n-button-group>-->
      <!--        <n-button @click="showHistory = true"-->
      <!--          >历史记录-->
      <!--          <template #icon>-->
      <!--            <n-icon :depth="3">-->
      <!--              <history-icon />-->
      <!--            </n-icon>-->
      <!--          </template>-->
      <!--        </n-button>-->
      <!--      </n-button-group>-->
    </div>
  </div>
</template>

<style scoped></style>
