<script setup lang="ts">
import { UploadFileInfo, useMessage } from 'naive-ui'
import { getAppData, importData } from '../../../services/DataService'

const message = useMessage()

interface UploadInfo {
  file: UploadFileInfo
}

const parseJSON = (e: UploadInfo) => {
  const file = e.file.file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const json = e.target?.result
      if (typeof json === 'string') {
        importData(json)
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
        <n-upload accept=".json" :on-before-upload="parseJSON">
          <n-button type="primary">导入数据</n-button>
        </n-upload>
        <n-button type="primary" @click="exportData">导出数据</n-button>
      </n-space>
    </n-space>
  </n-space>
</template>

<style scoped></style>
