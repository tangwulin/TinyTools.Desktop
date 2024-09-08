<script lang="ts" setup>
import type { ElectronAPI } from '@electron-toolkit/preload'
import { UploadFileInfo, useDialog, useMessage } from 'naive-ui'
import { getAppData, parseJSON } from '../../../services/DataService'

const message = useMessage()
const dialog = useDialog()

let isElectron: boolean
const electron = window.electron as ElectronAPI
try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

interface UploadInfo {
  file: UploadFileInfo
}

const relaunch = () => {
  if (!isElectron) {
    location.reload()
  } else {
    electron.ipcRenderer.send('relaunchApp')
  }
}

const getJsonText = (e: UploadInfo) => {
  const file = e.file.file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const json = e.target?.result
      if (typeof json === 'string') {
        parseJSON(json)
          .then(() => {
            dialog.success({
              title: '数据导入成功',
              content: '为保证应用能够正常使用，现在需要重启应用',
              maskClosable: false,
              positiveText: '现在重启',
              onPositiveClick: () => {
                relaunch()
              }
            })
          })
          .catch(() => {
            message.error('数据格式错误')
          })
      } else {
        message.error('文件格式错误')
      }
    }
    reader.readAsText(file)
  }
}

const exportData = async () => {
  const timestamp = Date.now()
  //TODO:把导出数据逻辑提取到services中
  const data = await getAppData()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `TinyTools_ExportData_${timestamp}.json`
  a.click()
}
</script>

<template>
  <n-space vertical>
    <n-space vertical>
      <p>数据导入与导出</p>
      <n-space>
        <n-upload :on-before-upload="getJsonText" accept=".json">
          <n-button type="primary">导入数据</n-button>
        </n-upload>
        <n-button type="primary" @click="exportData">导出数据</n-button>
      </n-space>
    </n-space>
  </n-space>
</template>

<style scoped></style>
