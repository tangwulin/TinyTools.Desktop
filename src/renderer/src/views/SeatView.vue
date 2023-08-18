<template>
  <div id="SeatView" class="flex items-center justify-center flex-col w-max h-auto m-auto">
    <div id="target-div" class="md:w-fit p-4" style="margin: 0 auto">
      <div class="flex items-center justify-center mb-4">
        <n-button :size='"large"'>讲台</n-button>
      </div>
      <div>
        <SeatTable
            v-model:seats="allSeats"
            v-model:rendering-list="oldRenderingList"
            :key="stKey"
            @update="updateHandler"
            :disable="isPreview || loading"
        />
      </div>
      <div class="flex justify-center mt-4">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>
    <div class="flex items-center justify-center mt-4 flex-col">

      <!-- 调试工具栏 -->
      <div v-show="enableDevelopFeature">
        <n-button-group>
          <n-button @click="colorEdge" :disabled="loading ||isPreview">染色边缘座位</n-button>
          <n-button @click="removeEdgeColor" :disabled="loading ||isPreview">去除所有染色</n-button>
        </n-button-group>
      </div>
      <div class="flex items-center justify-center flex-col md:flex-row flex-wrap md:w-3/5"> <!-- 操作区域 -->
        <!--        <n-button @click="reloadSeatTable" :disabled="loading">重载座位表组件</n-button>-->
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button @click="replaceSeats" :loading="loading" :disabled="loading ||isPreview">
              <template #icon>
                <n-icon>
                  <RefreshDot/>
                </n-icon>
              </template>
              重新排列座位
            </n-button>
          </template>
          ”优化“后的排座位方式，不会连续两次抽到边缘位置
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button @click="rollSeats(5)" :loading="loading" :disabled="loading ||isPreview">
              <template #icon>
                <n-icon>
                  <RefreshDot/>
                </n-icon>
              </template>
              按规则Roll座位
            </n-button>
          </template>
          先随机5次并展示每次结果，再将原始位置按“重新排列座位”的做法排列（虚 晃 一 枪）
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-popconfirm
                positive-text="确定"
                :negative-text="null"
                @positive-click="rollSeats(times)"
            >
              <!--suppress VueUnrecognizedSlot -->
              <template #trigger>
                <n-button :loading="loading" :disabled="loading ||isPreview">
                  <template #icon>
                    <n-icon>
                      <RefreshDot/>
                    </n-icon>
                  </template>
                  玩把大的！
                </n-button>
              </template>
              <div class="flex flex-row items-center">
                次数：
                <n-input-number clearable :precision="0" v-model:value="times"/>
              </div>
            </n-popconfirm>
          </template>
          与”按规则Roll座位“一样，只不过次数可以改
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button @click="gacha" :loading="loading" :disabled="loading ||isPreview">
              <template #icon>
                <n-icon>
                  <RefreshDot/>
                </n-icon>
              </template>
              抽卡！
            </n-button>
          </template>
          与”重新排列座位“一样，只不过会一个个的展示结果
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button @click="reSort" :loading="loading" :disabled="loading ||isPreview">
              <template #icon>
                <n-icon>
                  <Refresh/>
                </n-icon>
              </template>
              随机排列座位
            </n-button>
          </template>
          真·随机排列座位
          <del>，六亲不认的那种</del>
        </n-tooltip>
      </div>
      <div>
        <!--                <n-tooltip trigger="hover">-->
        <!--                  &lt;!&ndash;suppress VueUnrecognizedSlot &ndash;&gt;-->
        <!--                  <template #trigger>-->
        <!--                    <n-switch v-model:value="coloringEdgeSeats" @update:value="repaint" :disabled="loading"/>-->
        <!--                  </template>-->
        <!--                  边缘位置高亮-->
        <!--                </n-tooltip>-->
        <!-- 下方工具条 -->
        <n-button-group>
          <n-button @click="showHistory=true" :disabled="loading">历史记录</n-button>
          <n-button @click="showSetting=true">设置</n-button>
          <n-button @click="showManager" :disabled="loading ||isPreview">人员管理</n-button>
          <n-button @click="showMultiAddModal" :disabled="loading ||isPreview">增加人员</n-button>
          <n-button @click="save(scale)" :disabled="loading ||isPreview">保存图片</n-button>
          <n-dropdown
              :options="saveOptions"
              @select="save"
          >
            <n-button :disabled="loading ||isPreview">
              <template #icon>
                <ArrowDropDownFilled/>
              </template>
            </n-button>
          </n-dropdown>
        </n-button-group>
      </div>
    </div>


    <n-modal v-model:show="showSetting" style="width: 60%">
      <n-card
          style="width: 60%"
          title="设置"
          :bordered="true"
          size="small"
          closable
          @close="showSetting=false"
      >
        <div class="flex flex-row justify-items-start" style="height: 60vh">
          <div class="px-2 pt-2 mr-2 bg-gray-200 rounded">
            <n-list class="flex flex-col justify-center w-1/4 min-w-0">
              <template v-for="item in settings" :key="item.name">
                <n-list-item v-if="item.active" class="bg-gray-200 mt-auto">
                  <n-button text @click="handleSetting(item)">{{ item.name }}</n-button>
                </n-list-item>
              </template>
            </n-list>
          </div>
          <div class="flex flex-col justify-items-start w-full" :key="scKey">
            <div id="settingTitle"><p>{{ currentSetting.name }}</p></div>
            <div class="h-full overflow-y-hidden" id="settingContainer">
              <component :is="currentSetting.component" v-model:showAddModal="showAddModal"/>
            </div>
          </div>
        </div>
      </n-card>
    </n-modal>

    <n-drawer v-model:show="showHistory" :width="'31vw'">
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          <p>历史记录</p>
        </template>
        <history-drawer v-model:is-preview="isPreview" v-model:temp="temp"/>
        <template #footer v-if="isPreview">
          <n-button type="error" ghost @click="exitPreview" class="ml-auto">
            退出预览
          </n-button>
        </template>
      </n-drawer-content>
    </n-drawer>

    <div class="fixed top-0 left-0 mt-4 ml-4" v-if="isPreview">
      <n-button type="error" @click="exitPreview">
        退出预览
      </n-button>
    </div>

    <div class="fixed top-0 right-0 mt-4 mr-4" v-if="isPreview">
      <n-button type="success" @click="saveHistory('手动保存')">
        保存当前
      </n-button>
    </div>

    <div class="fixed bottom-0 left-0 mb-2 ml-2 text-xs">
      <p>TinyTools v{{ version }} Build <a :href="githubLink" target="_blank">{{ revision }}</a></p>
    </div>
    <div class="fixed bottom-0 right-0 mb-2 mr-2 ">
      <audio controls id="player" src="https://music.163.com/song/media/outer/url?id=430620198.mp3"></audio>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch, toRaw } from 'vue'
import {
  NButton,
  NButtonGroup,
  NCard,
  NIcon,
  NModal,
  NTooltip,
  useMessage
} from 'naive-ui'
import { Refresh, RefreshDot } from '@vicons/tabler'
import { ArrowDropDownFilled } from '@vicons/material'
import SeatTable from '@/components/SeatTable.vue'
import BgmSetting from './BgmSetting.vue'
import PersonManage from './PersonManage.vue'
import About from './AboutPage.vue'
import ImageSetting from './ImageSetting.vue'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import DevelopFeature from '../components/DevelopFeature.vue'
import { domToPng } from 'modern-screenshot'
import { useSeatStore } from '@/stores/seat'
import { usePersonStore } from '@/stores/person'
import { useSettingStore } from '@/stores/setting'
import { storeToRefs } from 'pinia'
import { getRenderingList, parseEdgeSeatIndex, replaceArrayElements } from '@/assets/script/seatHelper'
import { debounce, shuffle } from 'lodash-es'
import { getDefaultBgm, getDefaultFinalBgm } from '@/assets/script/musicHelper'

const version = __APP_VERSION__
const github_sha = __GITHUB_SHA__
const revision = __REVISION__
const githubLink = 'https://github.com/tangwulin/TinyTools/tree/' + github_sha

const message = useMessage()

const seatWorker = new Worker(new URL('../assets/script/seatWorker.js', import.meta.url), {
  type: 'module',
})

const seatStore = useSeatStore()
const personStore = usePersonStore()
const settingStore = useSettingStore()

const { allSeats, oldRenderingList, history } = storeToRefs(seatStore)
const { allPerson } = storeToRefs(personStore)
const {
  bgms,
  finalBgms,
  isBGMInitialized,
  enableBgm,
  enableFinalBgm,
  enableFadein,
  fadeinTime,
  scale,
  // enableQuickSave,
  enableDevelopFeature
} = storeToRefs(settingStore)

const temp = ref({ allSeats: null, oldRenderingList: null })
const showSetting = ref(false)
const showAddModal = ref(false)
const showHistory = ref(false)
const currentDate = ref('')
const currentTime = ref('')
const loading = ref(false)
const isPreview = ref(false)
const times = ref(5)
const stKey = ref(Math.random())
const scKey = ref(Math.random())
let msgReactive = null

const colorEdge = () => {
  const edgeIndex = parseEdgeSeatIndex(allSeats.value.length)
  edgeIndex.forEach(index => {
    allSeats.value[index].color = '#43a447'
  })
  oldRenderingList.value = getRenderingList(allSeats.value, oldRenderingList.value)
}

const removeEdgeColor = () => {
  allSeats.value.forEach(item => {item.color = null})
  oldRenderingList.value = getRenderingList(allSeats.value, oldRenderingList.value)
}

const settings = [
  { name: '🎶背景音乐', component: BgmSetting, active: true },
  { name: '💁人员管理', component: PersonManage, active: true },
  { name: '🖼️图片生成', component: ImageSetting, active: true },
  { name: '🛠️测试功能', component: DevelopFeature, active: enableDevelopFeature.value },
  { name: 'ℹ️关于', component: About, active: true }
]

let currentSetting = settings[0]

if (bgms.value.length === 0 || finalBgms.value.length === 0)
{
  bgms.value = getDefaultBgm()
  finalBgms.value = getDefaultFinalBgm()
  isBGMInitialized.value = true
}

let bgmList = shuffle(toRaw(bgms.value))
let bgmIndex = 0

let finalBgmList = shuffle(toRaw(finalBgms.value))
let finalBgmIndex = 0

const showManager = () => {
  currentSetting = { name: '💁人员管理', component: PersonManage }
  showSetting.value = true
}
const showMultiAddModal = () => {
  currentSetting = { name: '💁人员管理', component: PersonManage }
  showSetting.value = true
  showAddModal.value = true
}
const handleSetting = (x) => {
  currentSetting = x
  scKey.value = Math.random()
}

/**
 * 播放音频。
 *
 * @param {Object} option - 音频选项对象。
 * @param {string} option.url - 音频的URL。
 * @param {number} option.offset - 音频的起始播放时间（单位：秒）。
 * @param {string?} option.name - 音频的名称。
 */
const play = (option) => {
  const player = document.getElementById('player')
  player.src = option.url
  player.currentTime = option.offset
  if (option.name)
  {
    message.info('正在播放：' + option.name)
    console.log('正在播放：' + option.name)
  }
  if (enableFadein.value)
  {
    const originVol = player.volume
    player.volume = 0
    let i = 0
    const interval = setInterval(() => {
      i++
      player.volume = player.volume + originVol / 50
      if (i >= 50) clearInterval(interval)
    }, fadeinTime.value * 1000 / 50)

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
  const player = document.getElementById('player')
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

// 在组件挂载时开始更新日期和时间
onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  const player = document.getElementById('player')
  player.volume = 0.6 //关 音 菩 萨
})

// 在组件卸载时停止更新日期和时间
onUnmounted(() => {
  clearInterval(updateDateTime)
})

// 更新日期和时间
function updateDateTime()
{
  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()
  currentDate.value = date
  currentTime.value = time
}

const updateHandler = debounce(() => {saveHistory('手动更改')}, 100, { maxWait: 2000 })

const saveOptions = [
  {
    label: '图片分辨率（宽度）',
    key: 1,
    disabled: true
  },
  {
    label: '1080P',
    key: 2,

  }, {
    label: '4K',
    key: 4,
  },
]
/**
 * 保存当前座位为图片
 * @param {number}x 倍率，为横向分辨率/960
 * @returns {Promise<void>}
 */
const save = async (x) => {
  loading.value = true
  msgReactive = message.create('正在生成图片……', { type: 'loading', duration: 0 })

  const target = document.getElementById('target-div')
  const options = {
    filter: (node) => {
      try
      {
        return (!node.classList.contains('n-button--dashed'))
      }
      catch
      {
        return true
      }
    },
    backgroundColor: '#FFFFFF',
    scale: 960 * x / target.clientWidth
  }
  scale.value = x
  domToPng(target, options)
      .then(dataUrl => {
        const link = document.createElement('a')
        link.download = 'seat-' + currentDate.value + '-' + currentTime.value + '.png'
        link.href = dataUrl
        link.click()
      })
      .then(() => {
        msgReactive.content = '保存成功'
        msgReactive.type = 'success'
        loading.value = false
        setTimeout(() => {
          msgReactive.destroy()
          msgReactive = null
        }, 3000)
      })
}

/**
 * 在allSeats或oldRenderingList为空的情况下初始化。
 */
if (allSeats.value === null || oldRenderingList.value === null)
{
  if (history.value.length !== 0)
  {
    allSeats.value = history.value[0].allSeats
    oldRenderingList.value = history.value[0].oldRenderingList
  }
  else
  {
    allSeats.value = allPerson.value.map((name, index) => {
      return { name: name, index: index, isSeat: true }
    })
    oldRenderingList.value = getRenderingList(allSeats.value, [])
  }
}

if ((allPerson.value.length !== 0 && allSeats.value.length === 0) || allPerson.value.length !== allSeats.value.length)
{
  allSeats.value = allPerson.value.map((name, index) => {
    return { name: name, index: index, isSeat: true }
  })
  console.log('seat has been initialized')
}
/**
 * 保存当前座位到历史记录
 * @param {string?} type 抽选类型，会显示在历史记录里面
 */
const saveHistory = (type) => {
  const data = {
    time: Date.now(),
    allSeats: [...toRaw(allSeats.value.slice().map(item => {return { ...item, color: null }}))],
    oldRenderingList: [...toRaw(oldRenderingList.value).slice().map(item => {return { ...item, color: null }})],
    isCurrent: true,
    type: type || '???'
  }
  history.value = history.value.map(item => {return { ...item, isCurrent: false }})
  if (history.value.length !== 0 && history.value[0].type === '手动更改')
  {
    if (data.time - history.value[0].time > 60 * 1000)
      history.value.unshift(data)
    else
      history.value[0] = data
  }
  else
  {
    history.value = history.value.map(item => {return { ...item, isCurrent: false, isShowing: false }})
    history.value.unshift(data)
  }
  isPreview.value = false
  if (type === '手动保存' || type === '手动更改') message.success('保存成功')
}
/**
 * 真·随机排列座位，六亲不认的那种
 * @returns {Promise<void>}
 */
const reSort = async () => {
  loading.value = true
  await nextTick()
  allSeats.value = shuffle(allSeats.value).map((item, index) => {return { ...item, index: index }})
  await nextTick()
  await saveHistory('随机排列座位')
  setTimeout(() => {loading.value = false}, 50)
}
/**
 * 与”重新排列座位“一样，只不过会一个个的展示结果
 * @returns {Promise<void>}
 */
const gacha = async () => {
  loading.value = true
  playBgm()
  const data = JSON.parse(JSON.stringify(allSeats.value))
  console.log('主线程向worker发送消息：', data)
  seatWorker.postMessage(data)
  setTimeout(async () => {
    pauseBgm()
    await saveHistory('抽卡！')
    loading.value = false
    playFinalBgm()
  }, allSeats.value.length * 550)
}
/**
 * 先随机指定次数次并展示每次结果，再将原始位置按“重新排列座位”的做法排列（虚 晃 一 枪）
 * @param {number} x 次数
 * @returns {Promise<void>}
 */
const rollSeats = async (x) => {
  loading.value = true
  await nextTick()
  const originSeats = [...allSeats.value]
  let count = 0 // 计数器

  playBgm()

  const intervalId = setInterval(async () => {
    // 执行某个操作
    allSeats.value = shuffle(allSeats.value).map((item, index) => {
      return {
        ...item,
        index: index
      }
    })
    await nextTick()
    count++ // 增加计数器

    if (count === (x + 1))
    {
      clearInterval(intervalId) // 达到执行次数后清除定时器
      setTimeout(() => {loading.value = false}, 500)
      allSeats.value = replaceArrayElements(originSeats).map((item, index) => {
        return {
          ...item,
          index: index
        }
      })
      await saveHistory('按规则Roll座位')
      pauseBgm()
      playFinalBgm()
    }
  }, 500)
}
/**
 * ”优化“后的排座位方式，不会连续两次抽到边缘位置
 * @returns {Promise<void>}
 */
const replaceSeats = async () => {
  loading.value = true
  console.log('开始重新排列座位')
  const stopwatch = performance.now()
  await nextTick()
  allSeats.value = replaceArrayElements(allSeats.value).map((item, index) => {return { ...item, index: index }})
  await nextTick()
  console.log('执行完成,用时' + (performance.now() - stopwatch) + 'ms')
  setTimeout(async () => {
    await saveHistory('重新排列座位')
    loading.value = false
  }, 50)
}
/**
 * 通过刷新key的方式重新渲染SeatTable组件
 * @returns {Promise<void>}
 */
const reloadSeatTable = async () => {
  allSeats.value = [...allSeats.value] //这里不是脱裤子放屁，是为了触发侦听器
  stKey.value = Math.random() //刷新一下SeatTable组件
  console.log('SeatTable has been reload')
}
/**
 * 退出预览状态
 */
const exitPreview = () => {
  isPreview.value = false
  oldRenderingList.value = temp.value.oldRenderingList
  allSeats.value = temp.value.allSeats
  history.value = history.value.map(item => {return { ...item, isShowing: false }})
}

window.addEventListener('beforeunload', isPreview ? exitPreview : () => {})

watch(allPerson, reloadSeatTable)

watch(allSeats, () => {
  console.log('seat changed')
})

watch(oldRenderingList, () => {
  stKey.value = Math.random()
})

seatWorker.onmessage = function (event) {
  console.log('收到Web Worker的更新')
  allSeats.value = event.data
  reloadSeatTable()
}

</script>

<style scoped>
#SeatView {
  background: white;
  height: 100vh;
  width: 100vw;
  margin: 0
}
</style>
