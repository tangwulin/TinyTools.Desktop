<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, Ref, ref } from 'vue'
import SeatTable from '../../components/SeatTable.vue'
import { Seat, SeatState } from '../../types/seat'
import deepcopy from 'deepcopy'
import { AppDatabase } from '../../db'
import { Person } from '../../types/person'
import { calcNewSeatByWeight } from '../../utils/seatUtil'
import { shuffle } from 'lodash-es'
import { useMessage } from 'naive-ui'
import { useSettingStore } from '../../stores/setting'
import { storeToRefs } from 'pinia'
import { from, useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { SeatHistory } from '../../types/seatHistory'
import videoSrc from '../../assets/video/单抽出金.mp4'
import { History24Filled as HistoryIcon } from '@vicons/fluent'
import raffleConfig from '../../settings/raffleModes.json'

const db = AppDatabase.getInstance()

const message = useMessage()

const persons = ref([] as Person[])
const seats = ref([] as Seat[])
const seatMap = ref([] as SeatState[])
const seatHistory = useObservable(from(liveQuery(() => db.seatHistory.toArray()))) as Readonly<
  Ref<SeatHistory[]>
>

const settingStore = useSettingStore()
const { lotteryMode } = storeToRefs(settingStore)

const raffleModes = raffleConfig['raffleModes']

const currentDate = ref('')
const currentTime = ref('')

const showHistory = ref(false)
// const isPreview = ref(false)
const showHasDiffModal = ref(false)
const playingVideo = ref(false)

let updateDateTimeInterval: NodeJS.Timeout

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

onMounted(() => {
  updateDateTime()
  updateDateTimeInterval = setInterval(updateDateTime, 1000)
  const player = document.getElementById('player') as HTMLAudioElement
  if (player) {
    player.volume = 0.6 //关 音 菩 萨
  }
})

// 在组件卸载时停止更新日期和时间
onUnmounted(() => {
  clearInterval(updateDateTimeInterval)
})

// 更新日期和时间
function updateDateTime() {
  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()
  currentDate.value = date
  currentTime.value = time
}

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

const raffleSeatRemainMysterious = (result: Seat[]) => {
  seats.value = Array.from(
    { length: seats.value.length },
    (_, i) => new Seat({ avatar: '', genderCode: 9, number: '', score: 0, name: '???' }, i)
  )
  const series = shuffle(Array.from({ length: result.length }, (_, i) => i))

  let i = 0
  const timer = setInterval(() => {
    if (i < series.length) {
      seats.value = seats.value.map((item) => new Seat(item.owner, item.index, null))
      seats.value[series[i]] = result[series[i]]
      seats.value[series[i]].color = '#ADF7B6'
      i++
    } else {
      clearInterval(timer)
      seats.value = seats.value.map((item) => new Seat(item.owner, item.index, null))
      db.seats.bulkPut(deepcopy(seats.value))
      message.success('抽选完成')
    }
  }, 500)
}

const raffleSeatFeint = (result: Seat[], times: number) => {
  let i = 1
  const timer = setInterval(() => {
    if (i < times) {
      seats.value = shuffle(seats.value)
      i++
    } else {
      clearInterval(timer)
      seats.value = result
      db.seats.bulkPut(deepcopy(result))
      message.success('抽选完成')
    }
  }, 500)
}

const raffleSeatGacha = (result: Seat[]) => {
  playVideo()
  setTimeout(() => {
    seats.value = result
    db.seats.bulkPut(deepcopy(result))
  }, 3000)
}

const saveHistory = (currentSeat: Seat[], currentSeatMap: SeatState[], type: string) =>
  db.seatHistory.add(deepcopy(new SeatHistory(currentSeat, currentSeatMap, type)))

const handler = (type: 'Immediately' | 'RemainMysterious' | 'Feint' | 'Gacha', times?: number) => {
  let result = [] as Seat[]
  switch (lotteryMode.value) {
    case 1:
      result = shuffle(seats.value).map((item, index) => new Seat(item.owner, index))
      saveHistory(result, seatMap.value, '平等')
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
      saveHistory(result, seatMap.value, '相对公平')
      break
    default:
      message.error('抽选模式异常')
      break
  }

  if (result.length === 0) return

  switch (type) {
    case 'Immediately':
      raffleSeatImmediately(result)
      break
    case 'RemainMysterious':
      raffleSeatRemainMysterious(result)
      break
    case 'Feint':
      raffleSeatFeint(result, times ?? 5)
      break
    case 'Gacha':
      raffleSeatGacha(result)
      break
    default:
      message.error('展示模式异常')
      break
  }
}

const playVideo = () => {
  playingVideo.value = true
  nextTick(() => {
    const videoElement = document.querySelector('video')
    if (videoElement) {
      videoElement.addEventListener('ended', () => {
        playingVideo.value = false
        message.success('抽选完成')
      })
    }
  })
}
</script>

<template>
  <div
    id="SeatView"
    class="flex items-center justify-start flex-col h-auto m-auto"
    style="height: 100%; z-index: 1"
  >
    <!--  座位表展示区域  <-->
    <div id="target-div" style="margin: 0 auto; padding: 1.5rem 0">
      <div>
        <SeatTable v-model:seat-map="seatMap" v-model:seats="seats" />
      </div>
      <div class="flex justify-center mt-4" style="font-size: 1rem">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>

    <!--  下方操作按钮区域  <-->
    <div>
      <n-space justify="space-around">
        <n-p depth="3">座位预选：无</n-p>
        <n-popover>
          <template #trigger>
            <n-p depth="3"
              >抽选模式：{{ raffleModes.find((item) => item.value === lotteryMode).label }}
            </n-p>
          </template>
          <span>{{ raffleModes.find((item) => item.value === lotteryMode).description }}</span>
        </n-popover>
      </n-space>
      <n-button-group class="mt-2">
        <n-button @click="handler('Immediately')">直接出结果</n-button>
        <n-button @click="handler('RemainMysterious')">来点神秘感</n-button>
        <n-button @click="handler('Feint', 5)">虚 晃 一 枪</n-button>
        <n-button @click="handler('Gacha')">抽卡！</n-button>
        <!--        <n-button @click="playVideo">播放视频</n-button>-->
      </n-button-group>
    </div>

    <!--  悬浮的播放器  <-->
    <div class="fixed bottom-0 right-0 mb-2 mr-2">
      <audio
        id="player"
        controls
        src="https://music.163.com/song/media/outer/url?id=430620198.mp3"
        style="width: 16rem"
      />
    </div>

    <!--  历史记录按钮  <-->
    <div class="fixed top-3 right-4">
      <n-popover trigger="hover" placement="left">
        <template #trigger>
          <n-button text style="font-size: 36px" @click="showHistory = true">
            <n-icon :depth="3">
              <history-icon />
            </n-icon>
          </n-button>
        </template>
        <span>历史记录</span>
      </n-popover>
    </div>

    <!--  视频Modal  <-->
    <n-modal v-model:show="playingVideo" transform-origin="center">
      <video :src="videoSrc" preload="auto" autoplay style="width: 100%; height: 100%" />
    </n-modal>

    <!--  人数和座位数不一致Modal  <-->
    <n-modal v-model:show="showHasDiffModal">
      <n-card :bordered="false" aria-modal="true" role="dialog" size="huge" style="width: 60vw">
        <div class="flex flex-col items-center justify-center">
          <p>人数和座位数不一致</p>
          <p>是否重新分配座位？</p>
          <div class="flex items-center justify-center mt-4">
            <n-button size="small" type="primary" @click="showHasDiffModal = false"> 是</n-button>
            <n-button size="small" type="error" @click="showHasDiffModal = false"> 否</n-button>
          </div>
        </div>
      </n-card>
    </n-modal>

    <!--  历史记录Drawer  <-->
    <n-drawer v-model:show="showHistory" :width="'31vw'">
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          <p>历史记录</p>
        </template>
        <history-list :seat-history="seatHistory" />
        <!--        <template v-if="isPreview" #footer>-->
        <!--          <n-button class="ml-auto" ghost type="error" @click="exitPreview"> 退出预览</n-button>-->
        <!--        </template>-->
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped></style>
