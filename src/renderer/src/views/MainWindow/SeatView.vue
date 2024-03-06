<script lang="ts" setup>
import { History24Filled as HistoryIcon } from '@vicons/fluent'
import { KeyboardArrowDownRound as ArrowDownIcon } from '@vicons/material'
import deepcopy from 'deepcopy'
import { chunk, debounce, shuffle } from 'lodash-es'
import { domToPng } from 'modern-screenshot'
import { MessageReactive, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue'
import * as XLSX from 'xlsx'
import videoSrc from '../../assets/video/单抽出金.mp4'
import SeatTable from '../../components/SeatTable.vue'
import raffleConfig from '../../data/raffleModes.json'
import db from '../../db'
import { getDynamicSeatHistoryList, saveHistory } from '../../services/DBServices/SeatHistories'
import { useSettingStore } from '../../stores/setting'
import { Audio } from '../../types/audio'
import { Person } from '../../types/person'
import { Seat } from '../../types/seat'
import { SeatHistory } from '../../types/seatHistory'
import { SeatTableItem } from '../../types/SeatTableItem'
import {
  calcNewSeatByAssignMenAndWomenTogetherAlgorithm,
  calcNewSeatByCorrectionAlgorithm,
  calcNewSeatByRealRandom,
  calcNewSeatBySideToMiddleAlgorithm,
  genSeatTable,
  getSeatsFromSeatTable,
  reGenSeatTable,
  updateSeatTable
} from '../../utils/seatUtil'

const setting = useSettingStore()

const { enableBgm, enableFinalBgm, enableFadein, fadeinTime, bgms, finalBgms } =
  storeToRefs(setting)

const bgmList = shuffle(toRaw(bgms.value))
let bgmIndex = 0

const finalBgmList = shuffle(toRaw(finalBgms.value))
let finalBgmIndex = 0

const message = useMessage()

const persons = ref([] as Person[])
const seatHistories = getDynamicSeatHistoryList()
const seatTable = ref([] as SeatTableItem[])

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
const reverse = ref(false)

let updateDateTimeInterval: NodeJS.Timeout

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

      db.transaction('rw', db.seatTable, async () => {
        await db.seatTable.bulkPut(newSeatTable)
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

const raffleSeatImmediately = (result: SeatTableItem[]) => {
  seatTable.value = result
  db.seatTable.bulkPut(deepcopy(result))
  message.success('抽选完成')
}

const raffleSeatRemainMysterious = (result: SeatTableItem[]) => {
  loading.value = true
  playBgm()
  const newSeats = getSeatsFromSeatTable(result)
  seatTable.value = updateSeatTable(
    seatTable.value,
    newSeats.map((item) => {
      item.displayName = '???' //先把所有座位的displayName都改成???
      return item
    })
  )

  const series = shuffle(
    result.filter((item) => item.type === 'seat').map((item) => item.locationIndex as number)
  )

  let i = 0
  const timer = setInterval(() => {
    if (i < series.length) {
      //去除所有座位的颜色
      seatTable.value = seatTable.value.map((item) => {
        if (item.type !== 'seat') return item
        ;(item.data as Seat).color = undefined
        return item
      }) //给当前座位上色
      ;(seatTable.value[series[i]].data as Seat).color = '#ADF7B6' //重新添加displayName
      ;(seatTable.value[series[i]].data as Seat).displayName =
        persons.value.find((item) => item.id === (seatTable.value[series[i]].data as Seat).personId)
          ?.name ?? 'Error'
      i++
    } else {
      pauseBgm()
      clearInterval(timer)

      //去除所有座位的颜色
      seatTable.value = seatTable.value.map((item) => {
        if (item.type !== 'seat') return item
        ;(item.data as Seat).color = undefined
        return item as SeatTableItem
      })
      db.seatTable.bulkPut(deepcopy(seatTable.value))
      message.success('抽选完成')
      loading.value = false
      playFinalBgm()
    }
  }, 500)
}

const raffleSeatFeint = (result: SeatTableItem[], times: number) => {
  loading.value = true
  playBgm()
  let i = 1
  const timer = setInterval(() => {
    if (i < times) {
      seatTable.value = calcNewSeatByRealRandom(seatTable.value)
      i++
    } else {
      pauseBgm()
      clearInterval(timer)
      seatTable.value = result
      db.seatTable.bulkPut(deepcopy(result))
      message.success('抽选完成')
      loading.value = false
      playFinalBgm()
    }
  }, 500)
}

const raffleSeatGacha = (result: SeatTableItem[]) => {
  playVideo()
  setTimeout(() => {
    seatTable.value = result
    db.seatTable.bulkPut(deepcopy(result))
  }, 5000)
}

const handler = (type: 'Immediately' | 'RemainMysterious' | 'Feint' | 'Gacha', times?: number) => {
  let result = [] as SeatTableItem[]
  switch (lotteryMode.value) {
    case 1:
      result = calcNewSeatByRealRandom(seatTable.value)
      saveHistory(result, '平等')
      break
    case 2:
      message.error('尚未从V3移植')
      break
    case 3:
      result = calcNewSeatBySideToMiddleAlgorithm(seatTable.value)
      saveHistory(result, '两边到中间')
      break
    case 4:
      result = calcNewSeatByCorrectionAlgorithm(
        seatTable.value,
        seatHistories.value.at(-2)?.seatTable,
        seatHistories.value.at(-3)?.seatTable
      )
      saveHistory(result, '相对公平')
      break
    case 5:
      result = calcNewSeatByAssignMenAndWomenTogetherAlgorithm(seatTable.value, persons.value)
      saveHistory(result, '男女混坐')
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
  seatTable.value = x.seatTable
  message.info('正在预览 ' + new Date(x.timestamp).toLocaleString())
}

const exitPreview = () => {
  isPreview.value = false
  db.seatTable
    .toArray()
    .then((result) => (seatTable.value = result as SeatTableItem[]))
    .then(() => {
      message.success('已退出预览')
    })
}

const rollbackHandler = (x: SeatHistory) => {
  if (loading.value) {
    message.error('请先等待抽选完成后再进行回滚操作')
    return
  }
  if (isPreview.value) {
    exitPreview()
  }
  seatTable.value = x.seatTable
  saveHistory(x.seatTable, '回滚而来')
  message.success('已回滚到' + new Date(x.timestamp).toLocaleString())
}

const delHandler = (x: SeatHistory) => {
  db.seatHistories.delete(x.timestamp)
  message.success('删除成功')
}

const saveMethods = [
  { label: '保存为图片', key: 'saveAsPng' },
  { label: '保存为Excel', key: 'saveAsXlsx' }
]

const handleSave = (key: string) => {
  switch (key) {
    case 'saveAsPng':
      saveAsPng()
      break
    case 'saveAsXlsx':
      saveAsXlsx()
      break
    default:
      message.error('保存方法异常')
      break
  }
}
const saveAsPng = async () => {
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
      link.download = '座位表-' + currentDate.value + '-' + currentTime.value + '.png'
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

const saveAsXlsx = () => {
  const data = deepcopy(seatTable.value).filter((item) => item.type !== 'aisle')
  const names = data.map((item) => item.data?.displayName ?? '')
  const table = chunk(names, 8).map((row, rowIndex) => {
    const thisRow = {}
    thisRow['行数'] = `第${rowIndex + 1}行`
    for (let i = 0; i < row.length; i++) {
      const rowName = `第${i + 1}列`
      thisRow[rowName] = row[i]
    }
    return thisRow
  })
  const worksheet = XLSX.utils.json_to_sheet(table)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '座位表')
  XLSX.writeFile(workbook, '座位表-' + currentDate.value + '-' + currentTime.value + '.xlsx')
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
        if (i > 50) clearInterval(interval)
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
    db.transaction('rw', db.seatTable, db.seatHistories, async () => {
      await db.seatTable.bulkPut(deepcopy(seatTable.value))
      saveHistory(seatTable.value, '手动更改')
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
    <div
      id="target-div"
      style="margin: 0 0; padding: 1rem 0; height: calc(100vh - 6rem); width: 85%"
    >
      <div>
        <SeatTable
          v-model:seat-table-data="seatTable"
          :disable="loading || isPreview"
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
      <n-button-group style="display: flex; justify-items: center; align-items: center">
        <n-button @click="showHistory = true"
          >历史记录
          <template #icon>
            <n-icon :depth="3">
              <history-icon />
            </n-icon>
          </template>
        </n-button>
        <n-button :disabled="loading || isPreview" @click="saveAsPng">保存</n-button>
        <n-dropdown trigger="click" :options="saveMethods" @select="handleSave">
          <n-button :disabled="loading || isPreview" icon-placement="right" class="p-1">
            <template #icon>
              <n-icon>
                <ArrowDownIcon />
              </n-icon>
            </template>
          </n-button>
        </n-dropdown>
        <n-switch v-model:value="reverse">
          <template #checked> 老师视角</template>
          <template #unchecked> 学生视角</template>
        </n-switch>
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
      <n-button type="success" @click="saveHistory(seatTable, '手动保存')"> 保存当前</n-button>
    </div>

    <!--  视频Modal  <-->
    <n-modal v-model:show="playingVideo" transform-origin="center" :mask-closable="false">
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
          :seat-history="seatHistories"
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
