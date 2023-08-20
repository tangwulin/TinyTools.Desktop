<script setup>
import { useSettingStore } from '@/stores/setting'
import { storeToRefs } from 'pinia'
import { NButton, useMessage } from 'naive-ui'

const setting = useSettingStore()
const { enableDocking, enableDevelopFeature } = storeToRefs(setting)

const message = useMessage()

const isElectron = electron.process !== undefined
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
  electron.ipcRenderer.send("relaunchApp")
}

const clearData = () => {
  localStorage.clear()
  message.success('数据已清除！程序即将重启！')
  setTimeout(() => {
    electron.ipcRenderer.send("relaunchApp")
  }, 1000)
}

const relaunch = () => {
  electron.ipcRenderer.send("relaunchApp")
}

</script>

<template>
  <n-space vertical>
    <n-space justify="space-between">
      <n-space class="items-center">
        <div>更改后请重启程序</div>
        <n-button type="primary" :disabled="!isElectron" round @click="relaunch">重启</n-button>
      </n-space>
      <n-space class="items-center">
        <n-button type="error" round @click="clearData">清除数据</n-button>
        <n-button type="error" round @click="disableDevelopFeature">关闭调试功能</n-button>
      </n-space>
    </n-space>
    <n-space class="items-center">
      <n-button :disabled="!isElectron" type="primary" round @click="openDockWindow">启动dock</n-button>
      <n-button :disabled="!isElectron" type="primary" round @click="closeDockWindow">关闭dock</n-button>
    </n-space>
    <n-space class="items-center">
      <p>手动检查更新</p>
      <n-button :disabled="!isElectron||true" @click="checkUpdates">手动检查更新</n-button>
    </n-space>
    <n-space class="items-center">
      <p>启用dock栏</p>
      <n-switch v-model:value="enableDocking"/>
    </n-space>
  </n-space>

</template>

<style scoped>

</style>
