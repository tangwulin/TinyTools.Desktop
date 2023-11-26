<script lang="ts" setup>
import { History24Filled as HistoryIcon } from '@vicons/fluent'
import { from, useObservable } from '@vueuse/rxjs'
import deepcopy from 'deepcopy'
import { liveQuery } from 'dexie'
import { debounce, shuffle } from 'lodash-es'
import { domToPng } from 'modern-screenshot'
import { MessageReactive, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { nextTick, onMounted, onUnmounted, Ref, ref, toRaw } from 'vue'
import videoSrc from '../../assets/video/单抽出金.mp4'
import SeatTable from '../../components/SeatTable.vue'
import raffleConfig from '../../config/raffleModes.json'
import { AppDatabase } from '../../db'
import { useSettingStore } from '../../stores/setting'
import { Audio } from '../../types/audio'
import { Person } from '../../types/person'
import { Seat, SeatState } from '../../types/seat'
import { SeatHistory } from '../../types/seatHistory'
import { calcNewSeatByWeight, genSeatMap } from '../../utils/seatUtil'

const setting = useSettingStore()

const { enableBgm, enableFinalBgm, enableFadein, fadeinTime, bgms, finalBgms } =
  storeToRefs(setting)

const bgmList = shuffle(toRaw(bgms.value))
let bgmIndex = 0

const finalBgmList = shuffle(toRaw(finalBgms.value))
let finalBgmIndex = 0

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
const isPreview = ref(false)
const loading = ref(false)
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

const raffleSeatImmediately = (result: Seat[]) => {
  seats.value = result
  db.seats.bulkPut(deepcopy(result))
  message.success('抽选完成')
}

const raffleSeatRemainMysterious = (result: Seat[]) => {
  loading.value = true
  playBgm()
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
      pauseBgm()
      clearInterval(timer)
      seats.value = seats.value.map((item) => new Seat(item.owner, item.index, null))
      db.seats.bulkPut(deepcopy(seats.value))
      message.success('抽选完成')
      loading.value = false
      playFinalBgm()
    }
  }, 500)
}

const raffleSeatFeint = (result: Seat[], times: number) => {
  loading.value = true
  playBgm()
  let i = 1
  const timer = setInterval(() => {
    if (i < times) {
      seats.value = shuffle(seats.value)
      i++
    } else {
      pauseBgm()
      clearInterval(timer)
      seats.value = result
      db.seats.bulkPut(deepcopy(result))
      message.success('抽选完成')
      loading.value = false
      playFinalBgm()
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

const saveHistory = (currentSeat: Seat[], currentSeatMap: SeatState[], type: string) => {
  if (type === '手动更改') {
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
          if (Date.now() - result.timestamp < 1000 * 60) {
            db.seatHistory.delete(result.timestamp)
            //目的是为了避免用户在短时间内多次拖动座位导致的历史记录过多
          }
        }
      })
  }
  db.seatHistory.add(deepcopy(new SeatHistory(currentSeat, currentSeatMap, type)))
  message.success('已保存本次记录')
}

const handler = (type: 'Immediately' | 'RemainMysterious' | 'Feint' | 'Gacha', times?: number) => {
  let result = [] as Seat[]
  switch (lotteryMode.value) {
    case 1:
      result = shuffle(seats.value).map((item, index) => new Seat(item.owner, index))
      saveHistory(result, seatMap.value, '平等')
      break
    case 2:
      message.error('尚未从V3移植')
      break
    case 3:
      message.error('尚未从V3移植')
      break
    case 4:
      result = calcNewSeatByWeight(
        seats.value,
        (seatHistory.value as SeatHistory[])[0]?.seats ?? seats.value,
        (seatHistory.value as SeatHistory[])[1]?.seats ?? undefined
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

const previewHandler = (x: SeatHistory) => {
  if (loading.value) {
    message.error('请先等待抽选完成后再进行预览操作')
    return
  }
  isPreview.value = true
  seats.value = x.seats
  seatMap.value = x.seatMap
  message.info('正在预览 ' + new Date(x.timestamp).toLocaleString())
}

const exitPreview = () => {
  isPreview.value = false
  Promise.all([
    db.seats.toArray().then((result) => (seats.value = result as Seat[])),
    db.seatMap.toArray().then((result) => (seatMap.value = result as SeatState[]))
  ]).then(() => {
    message.success('已退出预览')
  })
}

const rollbackHandler = (x: SeatHistory) => {
  if (loading.value) {
    message.error('请先等待抽选完成后再进行回滚操作')
    return
  }
  seats.value = x.seats
  seatMap.value = x.seatMap
  db.seats.bulkPut(deepcopy(x.seats))
  db.seatMap.bulkPut(deepcopy(x.seatMap))
  saveHistory(x.seats, x.seatMap, '回滚而来')
  message.success('已回滚到' + new Date(x.timestamp).toLocaleString())
}

const delHandler = (x: SeatHistory) => {
  db.seatHistory.delete(x.timestamp)
  message.success('删除成功')
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

const play = (option: Audio) => {
  const player = document.getElementById('player') as HTMLAudioElement
  player.src = option.url
  player.currentTime = option.offset
  if (option.name) {
    message.info('正在播放：' + option.name)
    console.log('正在播放：' + option.name)
  }
  if (enableFadein.value) {
    const originVol = player.volume
    player.volume = 0
    let i = 0
    const interval = setInterval(
      () => {
        i++
        player.volume = player.volume + originVol / 50
        if (i >= 50) clearInterval(interval)
      },
      (fadeinTime.value * 1000) / 50
    )
  }
  player.play()
}
/**
 * 从抽选时音乐库里面挑一首出来放。
 */
const playBgm = () => {
  if (!enableBgm.value) return
  const bgm = bgmList[bgmIndex]
  console.log(bgmList)
  if (bgmIndex < bgmList.length - 1) bgmIndex++
  else bgmIndex = 0
  play(bgm)
}
/**
 * 顾名思义，暂停用的
 */
const pauseBgm = () => {
  const player = document.getElementById('player') as HTMLAudioElement
  player.pause()
}

const playFinalBgm = () => {
  if (!enableFinalBgm.value) return
  const bgm = finalBgmList[finalBgmIndex]
  console.log(finalBgmList)
  if (finalBgmIndex < finalBgmList.length - 1) finalBgmIndex++
  else finalBgmIndex = 0
  play(bgm)
}

const dragHandler = debounce(
  () => {
    db.seats.bulkPut(deepcopy(seats.value))
    db.seatMap.bulkPut(deepcopy(seatMap.value))
    saveHistory(seats.value, seatMap.value, '手动更改')
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
    <div
      id="target-div"
      style="margin: 0 0; padding: 1rem 0; height: calc(100vh - 6rem); width: 85%"
    >
      <div>
        <SeatTable
          v-model:seat-map="seatMap"
          v-model:seats="seats"
          :disable="loading || isPreview"
          @dragend="dragHandler"
        />
      </div>
      <div class="flex justify-center mt-4" style="font-size: 1rem">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>

    <!--  下方操作按钮区域  <-->
    <div style="display: flex; flex-direction: column">
      <n-space justify="space-around">
        <n-p depth="3">座位预选：无</n-p>
        <n-popover>
          <template #trigger>
            <n-p depth="3"
              >抽选模式：{{ raffleModes.find((item) => item.value === lotteryMode)?.label }}
            </n-p>
          </template>
          <span>{{ raffleModes.find((item) => item.value === lotteryMode)?.description }}</span>
        </n-popover>
      </n-space>
      <n-button-group class="mt-2">
        <n-button :disabled="loading || isPreview" @click="handler('Immediately')"
          >直接出结果
        </n-button>
        <n-button :disabled="loading || isPreview" @click="handler('RemainMysterious')"
          >来点神秘感
        </n-button>
        <n-button :disabled="loading || isPreview" @click="handler('Feint', 5)"
          >虚 晃 一 枪
        </n-button>
        <n-button :disabled="loading || isPreview" @click="handler('Gacha')">抽卡！</n-button>
        <!--        <n-button @click="playVideo">播放视频</n-button>-->
      </n-button-group>
      <n-button-group>
        <n-button @click="showHistory = true"
          >历史记录
          <template #icon>
            <n-icon :depth="3">
              <history-icon />
            </n-icon>
          </template>
        </n-button>
        <n-button :disabled="loading || isPreview" @click="save">保存图片</n-button>
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

    <div v-if="isPreview" class="absolute top-0 left-0 mt-4 ml-4">
      <n-button type="error" @click="exitPreview"> 退出预览</n-button>
    </div>

    <div v-if="isPreview" class="absolute top-0 right-0 mt-4 mr-4">
      <n-button type="success" @click="saveHistory(seats, seatMap, '手动保存')"> 保存当前</n-button>
    </div>

    <!--  视频Modal  <-->
    <n-modal v-model:show="playingVideo" transform-origin="center">
      <video :src="videoSrc" autoplay preload="auto" style="width: 100%; height: 100%" />
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
        <history-list
          :seat-history="seatHistory"
          @delete="delHandler"
          @preview="previewHandler"
          @rollback="rollbackHandler"
        />
        <template v-if="isPreview" #footer>
          <n-button class="ml-auto" ghost type="error" @click="exitPreview"> 退出预览</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped></style>
