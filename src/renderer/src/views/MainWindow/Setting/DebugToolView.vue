<script setup>
import { ref } from 'vue'
import { useSettingStore } from '../../../stores/setting'
import { storeToRefs } from 'pinia'
import { NButton, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import JsonEditorVue from 'json-editor-vue'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { useSeatStore } from '../../../stores/seat'

const settingStore = useSettingStore()
const { enableDocking, enableDevelopFeature } = storeToRefs(settingStore)

const seatStore = useSeatStore()
const { seats, seatMap, history } = storeToRefs(seatStore)
const message = useMessage()

const destination = ref('')
const router = useRouter()

const showModal = ref(false)
const confirm = ref('')

let isElectron = null
try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}
const openDockWindow = async () => {
  electron.ipcRenderer.send('openDockWindow')
}

const closeDockWindow = () => {
  electron.ipcRenderer.send('closeDockWindow')
}
const checkUpdates = async () => {
  // const update = await checkUpdate()
  // message.info('检查更新结果：' + JSON.stringify(update))
  message.error('未实现')
}

const disableDevelopFeature = () => {
  enableDevelopFeature.value = false
  electron.ipcRenderer.send('relaunchApp')
}

const clearData = () => {
  localStorage.clear()
  message.success('数据已清除！程序即将重启！')
  setTimeout(() => {
    relaunch()
  }, 1000)
}

const relaunch = () => {
  if (!isElectron) {
    location.reload()
  } else {
    electron.ipcRenderer.send('relaunchApp')
  }
}

const navTo = (name) => {
  if (router.hasRoute(name)) {
    message.success('匹配成功！即将跳转！')
    setTimeout(() => {
      router.push({ name: name })
    }, 100)
  } else {
    message.error('路由不存在')
  }
}

const saveHistory = (type) => {
  const data = {
    time: Date.now(),
    seats: [
      // ...toRaw(
      //   seats.value.slice().map((item) => {
      //     return { ...item, color: null }
      //   })
      // )
      ...seats
    ],
    seatMap: [
      // ...toRaw(seatMap.value)
      //   .slice()
      //   .map((item) => {
      //     return { ...item, color: null }
      //   })
      ...seatMap
    ],
    isCurrent: true,
    type: type || '???'
  }
  history.value = history.value.map((item) => {
    return { ...item, isCurrent: false }
  })
  if (history.value.length !== 0 && history.value[0].type === '手动更改') {
    //这里没有对初始位置进行判断，因为到这个页面意味着已经开始正常使用了
    if (data.time - history.value[0].time > 60 * 1000) history.value.unshift(data)
    else history.value[0] = data
  } else {
    history.value = history.value.map((item) => {
      return { ...item, isCurrent: false, isShowing: false }
    })
    history.value.unshift(data)
  }
  // isPreview.value = false
  if (type === '手动保存' || type === '手动更改') message.success('保存成功')
}
const ua = navigator.userAgent
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 50vw"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showModal = false"
    >
      <n-text type="error" style="font-size: 2rem">请注意，你正在清除所有数据！</n-text>
      <n-p>输入‘yes’确认清除数据</n-p>
      <n-input v-model:value="confirm" />
      <template #footer>
        <div style="display: flex; flex-direction: row-reverse">
          <n-button type="error" :disabled="confirm !== 'yes'" @click="clearData"
            >清除数据</n-button
          >
        </div>
      </template>
    </n-card>
  </n-modal>
  <n-space vertical>
    <p>浏览器/Webview的UA：{{ ua }}</p>
    <n-space justify="space-between">
      <n-space class="items-center">
        <div>更改后请重启程序</div>
        <n-button :disabled="!isElectron" round type="primary" @click="relaunch">重启 </n-button>
      </n-space>
      <n-space class="items-center">
        <n-button round type="error" @click="showModal = true">清除数据</n-button>
        <n-button round type="error" @click="disableDevelopFeature">关闭调试功能 </n-button>
      </n-space>
    </n-space>
    <n-space class="items-center">
      <n-button :disabled="!isElectron" round type="primary" @click="openDockWindow"
        >启动dock
      </n-button>
      <n-button :disabled="!isElectron" round type="primary" @click="closeDockWindow"
        >关闭dock
      </n-button>
    </n-space>
    <n-space class="items-center">
      <p>手动检查更新</p>
      <n-button :disabled="!isElectron || true" @click="checkUpdates">手动检查更新 </n-button>
    </n-space>
    <n-space class="items-center">
      <p>启用dock栏</p>
      <n-switch v-model:value="enableDocking" />
    </n-space>
    <n-space class="items-center">
      <p>跳转到任意路由（慎用）</p>
      <n-input v-model:value="destination" />
      <n-button round type="primary" @click="navTo(destination)">跳转 </n-button>
    </n-space>
    <n-space class="items-center"> </n-space>
    <p>座位信息修改</p>
    <div>
      <span style="font-size: 1rem; color: red; margin-right: 1rem"
        >注意：修改实时生效，不可回滚，修改错误会导致程序无法正常使用
        （如下方只有null请切回座位抽选页再切回这里）</span
      >
      <n-button type="warning" @click="saveHistory('手动更改')">保存一次历史记录</n-button>
    </div>

    <n-collapse id="xxx">
      <n-collapse-item title="原始座位信息">
        <div class="json-editor">
          <JsonEditorVue v-model="seats" style="width: 100%" class="jse-theme-dark mr-3" />
        </div>
      </n-collapse-item>
      <n-collapse-item title="渲染座位信息">
        <div class="json-editor">
          <JsonEditorVue v-model="seatMap" style="width: 100%" class="jse-theme-dark mr-3" />
        </div>
      </n-collapse-item>
    </n-collapse>
  </n-space>
</template>

<style scoped>
.json-editor {
  width: 100%;
  max-height: calc(100vh - 10rem);
  display: flex;
}
</style>
