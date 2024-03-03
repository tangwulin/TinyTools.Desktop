<script lang="ts" setup>
import deepcopy from 'deepcopy'
import { debounce, shuffle } from 'lodash-es'
import { domToPng } from 'modern-screenshot'
import { MessageReactive, useMessage } from 'naive-ui'
import { ref } from 'vue'
import SeatTable from '../../../components/SeatTable.vue'
import db from '../../../db'
import { Person } from '../../../types/person'
import { Seat } from '../../../types/seat'
import { SeatHistory } from '../../../types/seatHistory'
import { SeatTableItem } from '../../../types/SeatTableItem'
import {
  genSeatTable,
  getSeatsFromSeatTable,
  reGenSeatTable,
  updateSeatTable
} from '../../../utils/seatUtil'

const message = useMessage()

const persons = ref([] as Person[])
const seatTable = ref([] as SeatTableItem[])

const reverse = ref(false)
const loading = ref(false)

const personsPromise = db.persons.toArray().then((result) => {
  persons.value = result as Person[]
})

const seatTablePromise = db.seatTable.toArray().then((result) => {
  seatTable.value = result
})

Promise.all([personsPromise, seatTablePromise]).then(() => {
  const personsCount = persons.value.length
  const seatTableCount = seatTable.value.filter((item) => item.type === 'seat').length

  if (personsCount !== seatTableCount) {
    console.log(personsCount, seatTableCount)
    console.log('人数和座位数不一致')
    const seats = persons.value.map((item, index) => new Seat(item.name, index, undefined, item.id))
    let newSeatTable = [] as SeatTableItem[]
    if (seatTable.value.length === 0) {
      //没有座位表，直接生成
      newSeatTable = genSeatTable(seats)

      db.transaction('rw', db.seatTable, db.seatHistories, async () => {
        await db.seatTable.bulkPut(newSeatTable)
        saveHistory(seatTable.value, '初始座位')
      })
        .then(() => {
          // seatTable.value = newSeatTable
          message.success('已生成座位表')
        })
        .catch((err) => {
          console.log(err)
          message.error('生成座位表失败')
        })
    } else {
      message.error('人数和座位数不一致,尝试重新生成座位表')
      //有座位表，尝试重新生成
      newSeatTable = reGenSeatTable(seatTable.value, seats)

      db.transaction('rw', db.seatTable, async () => {
        await db.seatTable.bulkPut(deepcopy(newSeatTable))
      })
        .then(() => {
          // seatTable.value = newSeatTable
          message.success('已重新生成座位表')
        })
        .catch((err) => {
          console.log(err)
          message.error('重新生成座位表失败')
        })
    }
    seatTable.value = newSeatTable
  }
  //用于人名更新后更新座位的显示名
  seatTable.value = seatTable.value.map((item) => {
    if (item.type !== 'seat') return item
    else {
      const person = persons.value.find((person) => person.id === item.data?.personId)
      if (person) (item.data as Seat).displayName = person.name
      else (item.data as Seat).displayName = 'Error'
      return item
    }
  })
})

const raffleSeatImmediately = (result: SeatTableItem[]) => {
  seatTable.value = result
  db.transaction('rw', db.seatTable, db.seatHistories, async () => {
    await db.seatTable.bulkPut(deepcopy(result))
    saveHistory(result, '初始座位')
  })
  message.success('抽选完成')
}

const saveHistory = (currentSeatTable: SeatTableItem[], type: string) => {
  if (type === '初始座位') {
    db.seatHistories
      .orderBy('timestamp')
      .reverse()
      .limit(1)
      .first()
      .then((result) => {
        if (result) {
          if (JSON.stringify(result.seatTable) === JSON.stringify(currentSeatTable)) {
            //未发生变化，无需保存
            return
          }
          db.seatHistories.delete(result.timestamp)
        }
      })
  }
  db.seatHistories.add(deepcopy(new SeatHistory(Date.now(), currentSeatTable, type)))
  message.success('已保存本次记录')
}

const handler = () => {
  const newSeats = shuffle(getSeatsFromSeatTable(seatTable.value)).map((item, index) => {
    item.locationIndex = index
    return item
  }) as Seat[]
  if (newSeats.length === 0) return

  try {
    const result = updateSeatTable(seatTable.value, newSeats)
    raffleSeatImmediately(result)
  } catch (e) {
    message.error(JSON.stringify(e))
    console.log(e)
  }
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
    db.transaction('rw', db.seatTable, db.seatHistories, async () => {
      await db.seatTable.bulkPut(deepcopy(seatTable.value))
      saveHistory(seatTable.value, '初始座位')
    })
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
        v-model:seat-table-data="seatTable"
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
