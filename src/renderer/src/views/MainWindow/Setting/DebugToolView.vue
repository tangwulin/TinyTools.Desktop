<script lang="ts" setup>
import { type ElectronAPI } from '@electron-toolkit/preload'
import { NButton, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppDatabase } from '../../../db'
import { LocalCacheProvider } from '../../../providers/LocalCacheProvider'
import backupDB from '../../../services/BackupService'
import { createCache } from '../../../services/CacheService'
import { getAppData } from '../../../services/DataService'
import { useSettingStore } from '../../../stores/setting'

const db = AppDatabase.getInstance()

const settingStore = useSettingStore()
const { enableDocking, enableDevelopFeature } = storeToRefs(settingStore)

const message = useMessage()

const destination = ref('')
const router = useRouter()

const showModal = ref(false)
const confirm = ref('')

let isElectron: boolean
const electron = window.electron as ElectronAPI

const imageSrc = ref('')
const cache = createCache(new LocalCacheProvider())
cache('https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png').then((res) => {
  imageSrc.value = res
})

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
  db.delete()
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

const ua = navigator.userAgent

const filePath = ref('')
const getThumbnail = async () => {
  const result = await electron.ipcRenderer.invoke('getThumbnail', filePath.value)
  console.log(result)
  message.success('获取成功！')
  message.info('结果：' + JSON.stringify(result))
}

const throwError = () => {
  throw new Error('测试错误')
}

const testAddBackup = async () => {
  const data = await getAppData()
  console.log(data)
  await backupDB.addBackup(data)
}
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 50vw"
      @close="showModal = false"
    >
      <n-text style="font-size: 2rem" type="error">请注意，你正在清除所有数据！</n-text>
      <n-p>输入‘yes’确认清除数据</n-p>
      <n-input v-model:value="confirm" />
      <template #footer>
        <div style="display: flex; flex-direction: row-reverse">
          <n-button :disabled="confirm !== 'yes'" type="error" @click="clearData"
            >清除数据
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
  <n-space vertical>
    <p>浏览器/Webview的UA：{{ ua }}</p>
    <n-space justify="space-between">
      <n-space class="items-center">
        <div>更改后请重启程序</div>
        <n-button :disabled="!isElectron" round type="primary" @click="relaunch">重启</n-button>
      </n-space>
      <n-space class="items-center">
        <n-button round type="error" @click="showModal = true">清除数据</n-button>
        <n-button round type="error" @click="disableDevelopFeature">关闭调试功能</n-button>
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
      <n-button :disabled="!isElectron || true" @click="checkUpdates">手动检查更新</n-button>
    </n-space>
    <n-space class="items-center">
      <p>启用dock栏</p>
      <n-switch v-model:value="enableDocking" />
    </n-space>
    <n-space class="items-center">
      <p>跳转到任意路由（慎用）</p>
      <n-input v-model:value="destination" />
      <n-button round type="primary" @click="navTo(destination)">跳转</n-button>
    </n-space>
    <n-space class="items-center">
      <p>获取文件缩略图</p>
      <n-input v-model:value="filePath" />
      <n-button round type="primary" @click="getThumbnail">获取</n-button>
    </n-space>
    <n-space class="items-center">
      <p>手动抛出错误</p>
      <n-button round type="primary" @click="throwError">抛出测试错误</n-button>
    </n-space>
    <n-space class="items-center">
      <p>备份测试</p>
      <n-button round type="primary" @click="testAddBackup">备份测试</n-button>
    </n-space>
    <n-space class="items-center">
      <p>缓存测试</p>
      <n-image :src="imageSrc" />
    </n-space>
  </n-space>
</template>

<style scoped></style>
