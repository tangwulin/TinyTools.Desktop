<script lang="ts" setup>
import deepcopy from 'deepcopy'
import { debounce, shuffle } from 'lodash-es'
import { domToPng } from 'modern-screenshot'
import { MessageReactive, useMessage } from 'naive-ui'
import { ref } from 'vue'
import SeatTable from '../../../components/SeatTable.vue'
import { AppDatabase } from '../../../db'
import { Person } from '../../../types/person'
import { Seat, SeatState } from '../../../types/seat'
import { SeatHistory } from '../../../types/seatHistory'
import { genSeatMap } from '../../../utils/seatUtil'

const db = AppDatabase.getInstance()

const message = useMessage()

const persons = ref([] as Person[])
const seats = ref([] as Seat[])
const seatMap = ref([] as SeatState[])

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

const handler = () => {
  const result = shuffle(seats.value).map((item, index) => new Seat(item.owner, index))
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
    // filter: (node) => {
    //   try {
    //     return !node.classList.contains('border-dashed')
    //   } catch {
    //     return true
    //   }
    // },
    backgroundColor: '#FFFFFF',
    scale: 3840 / target.clientWidth //统一保存为4K分辨率
  }
  // scale.value = x;
  domToPng(target, options)
    .then((dataUrl) => {
      const link = document.createElement('a')
      link.download = '初始座位.png'
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
      <SeatTable
        v-model:seat-map="seatMap"
        v-model:seats="seats"
        :disable="loading"
        :reverse="reverse"
        @dragend="dragHandler"
      />
    </div>

    <!--  下方操作按钮区域  <-->
    <p>
      上面是系统按导入姓名的顺序自动分配的座位，如果需要调整，可以拖动座位到另一个位置上来交换这两个座位的位置
    </p>
    <div style="display: flex; flex-direction: column">
      <n-space class="mt-2 flex flex-col justify-center items-center">
        <n-button :disabled="loading" @click="handler">重抽座位</n-button>
        <n-button :disabled="loading" @click="save">保存图片</n-button>
        <n-switch v-model:value="reverse">
          <template #checked> 老师视角</template>
          <template #unchecked> 学生视角</template>
        </n-switch>
      </n-space>
    </div>
  </div>
</template>

<style scoped></style>
