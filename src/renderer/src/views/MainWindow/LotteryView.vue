<script lang="ts" setup>
import { LuckyWheel } from '@lucky-canvas/vue'
import { DragHandleRound as HandleIcon } from '@vicons/material'
import { useEventListener, useWindowSize } from '@vueuse/core'
import { type UploadFileInfo, useDialog, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import draggable from 'vuedraggable-swap'
import { useLotteryStore } from '../../stores/lottery'
import { Prize } from '../../types/prize'
import { SpinPrize } from '../../types/spinPrize'

const dialog = useDialog()
const message = useMessage()

const windowWidth = useWindowSize().width

const lotteryStore = useLotteryStore()

const { prizeList, prizeHistory } = storeToRefs(lotteryStore)

const spinRef = ref<typeof LuckyWheel>()
const spinKey = ref(0)

const showHistory = ref(false)
const showConfigModal = ref(false)
const showImportExportModal = ref(false)

//是否可以作废本次抽奖
const canCancel = ref(false)

useEventListener('resize', () => {
  spinKey.value = Math.random()
})

const spinPrizeList = computed(() => {
  return prizeList.value.map(
    (prize) =>
      ({
        range: prize.percentage,
        background: prize.backgroundColor,
        fonts: [
          { text: prize.name, top: '10%' },
          { text: `剩余${prize.amount}个`, top: '40%' }
        ]
      }) as SpinPrize
  )
})

const spinStyle = computed(() => ({ fontSize: windowWidth.value / 60 }))

const blocks = [{ padding: '13px', background: '#617df2' }]

const buttons = [
  {
    radius: '35%',
    background: '#8a9bf3',
    pointer: true,
    fonts: [{ text: '开始', top: '-10px' }]
  }
]

//从prizeList随机挑一个奖项
const randomPrize = () => {
  const total = prizeList.value.reduce((acc, cur) => acc + cur.amount, 0)
  const random = Math.random() * total
  let sum = 0
  for (let i = 0; i < prizeList.value.length; i++) {
    sum += prizeList.value[i].amount
    if (random < sum) {
      return i
    }
  }
  return -1
}

const startCallback = () => {
  //先判断是否还有奖品
  if (prizeList.value.every((prize) => prize.amount === 0)) {
    dialog.warning({
      title: '警告',
      content: '奖品已抽完，请先设置奖项'
    })
    return
  }

  // 调用抽奖组件的play方法开始游戏
  spinRef.value?.play()
  setTimeout(() => {
    const index = randomPrize()
    prizeList.value[index].amount--
    prizeHistory.value.push({ name: prizeList.value[index].name, timestamp: Date.now() })
    // 调用stop停止旋转并传递中奖索引
    spinRef.value?.stop(index)
  }, 3000)
}
// 抽奖结束会触发end回调
const endCallback = () => {
  canCancel.value = true
  dialog.success({
    title: '恭喜',
    content: `恭喜你抽中了${prizeHistory.value[prizeHistory.value.length - 1].name}`
  })
}

const genRandomColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padEnd(6, '0')
  )
}
const addPrize = () => {
  prizeList.value.push(new Prize(`奖项${prizeList.value.length + 1}`, 1, genRandomColor()))
}

const exportPrize = () => {
  const data = JSON.stringify(prizeList.value)
  const blob = new Blob([data], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '奖项设置.json'
  a.click()
  URL.revokeObjectURL(url)
}

interface UploadInfo {
  file: UploadFileInfo
}

const importPrize = (e: UploadInfo) => {
  const file = e.file.file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      if (typeof data === 'string') {
        prizeList.value = JSON.parse(data)
        showImportExportModal.value = false
        message.success('导入成功')
      }
    }
    reader.readAsText(file)
  }
}

const clearPrize = () => {
  dialog.warning({
    title: '警告',
    content: '确定要清空奖项吗？',
    positiveText: '确定',
    negativeText: '不确定',
    onPositiveClick: () => {
      prizeList.value = []
      message.success('清空完成')
    },
    onNegativeClick: () => {}
  })
}

const cancelLottery = () => {
  if (canCancel.value) {
    dialog.warning({
      title: '警告',
      content: '确定要作废本次抽奖吗？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        const lastHistory = prizeHistory.value.pop()
        if (lastHistory) {
          const prize = prizeList.value.find((prize) => prize.name === lastHistory.name)
          if (prize) {
            prize.amount++
          }
        }
        canCancel.value = false
        message.success('作废成功')
      },
      onNegativeClick: () => {}
    })
  } else {
    message.warning('当前无法作废')
  }
}
</script>

<template>
  <n-layout id="lotteryView">
    <n-layout-content
      content-style="height: 100%;display:flex;flex-direction:column;align-content:center;justify-items:center"
      position="absolute"
      style="height: 100%"
    >
      <span style="font-size: 2rem; margin: 0.5rem auto 1.5rem">幸运抽奖</span>
      <div id="spin">
        <LuckyWheel
          v-if="spinPrizeList?.length > 0"
          :key="spinKey"
          ref="spinRef"
          :blocks="blocks"
          :buttons="buttons"
          :default-style="spinStyle"
          :prizes="spinPrizeList"
          height="40vw"
          style="margin: auto"
          width="40vw"
          @end="endCallback"
          @start="startCallback"
        />
        <n-p v-else depth="3" style="font-size: 2rem; margin: auto"> 请先设置奖项</n-p>
      </div>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div class="flex flex-col justify-center items-center" style="height: 6rem">
        <n-button-group>
          <n-button @click="showConfigModal = true">奖项设置</n-button>
          <n-button @click="showHistory = true">历史记录</n-button>
          <n-button :disabled="!canCancel" @click="cancelLottery">作废本次</n-button>
          <!--          <n-button>从头开始</n-button>-->
        </n-button-group>
        <n-p depth="3">本功能数据将在关闭或重启应用时清除</n-p>
      </div>
    </n-layout-footer>
  </n-layout>

  <!-- 奖项设置Modal -->
  <n-modal v-model:show="showConfigModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      size="huge"
      style="width: 70%"
      title="奖项设置"
      @close="showConfigModal = false"
    >
      <draggable v-model="prizeList" item-key="id">
        <template #item="{ element }">
          <n-space
            class="prizeItem"
            item-style="display: flex;flex-direction: column;justify-content: center;align-items: center;"
          >
            <n-icon size="24">
              <HandleIcon />
            </n-icon>
            <span>显示名</span>
            <n-input v-model:value="element.name" />
            <span>数量</span>
            <n-input-number v-model:value="element.amount" :min="1" style="width: 5rem" />
            <span>背景色</span>
            <n-color-picker
              v-model:value="element.backgroundColor"
              :show-alpha="false"
              style="width: 6rem; margin-top: 0.3rem"
            />
            <n-button type="error" @click="prizeList.splice(prizeList.indexOf(element), 1)"
              >删除
            </n-button>
          </n-space>
        </template>
      </draggable>
      <template #footer>
        <div class="flex justify-end">
          <n-space>
            <n-button type="success" @click="addPrize">增加新奖项</n-button>
            <n-button @click="showImportExportModal = true">导入/导出</n-button>
            <n-button type="warning" @click="clearPrize">全部清空</n-button>
          </n-space>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showImportExportModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      size="huge"
      style="width: 50%"
      title="导入与导出"
      @close="showImportExportModal = false"
    >
      <n-space direction="vertical">
        <n-button type="primary" @click="exportPrize">导出奖项设置</n-button>
        <n-upload :on-before-upload="importPrize" accept=".json">
          <n-button type="primary">导入奖项设置</n-button>
        </n-upload>
      </n-space>
    </n-card>
  </n-modal>

  <!--  历史记录Drawer  <-->
  <n-drawer v-model:show="showHistory">
    <n-drawer-content :native-scrollbar="false">
      <template #header>
        <p>历史记录</p>
      </template>
      <n-space direction="vertical">
        <n-space direction="vertical">
          <n-p v-if="prizeHistory.length === 0" depth="3">暂无历史记录</n-p>
          <n-p v-for="history in prizeHistory" v-else :key="history.timestamp" depth="3">
            {{ history.name }} - {{ new Date(history.timestamp).toLocaleString() }}
          </n-p>
        </n-space>
      </n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
#lotteryView {
  height: 100%;
  width: 100%;
  margin: 0 auto;
}

#spin {
  height: calc(100vh - 11.5rem);
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-items: center;
}

.prizeItem {
  height: 3rem;
  width: 100%;
  border: solid 1px #e9e8fe;
}
</style>
