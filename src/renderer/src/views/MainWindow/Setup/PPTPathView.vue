<script setup lang="ts">
import type { ElectronAPI } from '@electron-toolkit/preload'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'
import { useCourseStore } from '../../../stores/course'

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

const courseStore = useCourseStore()
const { coursesTable, pptPath } = storeToRefs(courseStore)

const courses = new Set<string>()

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'spe1', 'spe2', 'spe3', 'spe4', 'spe5']

coursesTable.value.forEach((item) => {
  days.forEach((day) => {
    courses.add(item[day])
  })
})

async function initPaths() {
  let rootPath = ''
  const hasDDriver = await electron.ipcRenderer.invoke('pathExists', 'D:\\')
  if (hasDDriver) {
    !(await electron.ipcRenderer.invoke('pathExists', 'D:\\课件'))
      ? await electron.ipcRenderer.invoke('createFolder', 'D:\\课件')
      : undefined
    rootPath = 'D:\\课件'
  } else {
    rootPath = await electron.ipcRenderer.invoke('getPath', 'documents')
  }
  pptPath.value = Array.from(courses).map((item) => ({
    subject: item,
    path: rootPath + `\\${item}`
  }))
}

if (pptPath.value.length === 0) {
  initPaths()
} else {
  pptPath.value = pptPath.value.filter((item) => courses.has(item.subject))
  courses.forEach((item) => {
    if (!pptPath.value.find((path) => path.subject === item)) {
      pptPath.value.push({ subject: item, path: '' })
    }
  })
}

function showOpenDialog(path: string, subject: string) {
  if (!isElectron) {
    console.error('Not in electron')
    return
  }
  electron.ipcRenderer
    .invoke('showOpenDialog', {
      title: `选择${subject}文件夹`,
      defaultPath: path,
      properties: ['openDirectory', 'dontAddToRecent']
    })
    .then((res) => {
      if (res.canceled) return
      pptPath.value = pptPath.value.map((item) => {
        if (item.subject === subject) {
          return { subject, path: res.filePaths[0] }
        }
        return item
      })
    })
}

onBeforeRouteLeave(async (_, __, next) => {
  if (pptPath.value.some((item) => item.path === '')) {
    const confirm = window.confirm('有课程未设置课件位置，是否继续？')
    if (confirm) {
      await Promise.all(
        pptPath.value.map((item) => electron.ipcRenderer.invoke('createFolder', item.path))
      ).catch((e) => {
        console.error(e)
        next()
      })
      next()
    } else {
      next(false)
    }
  } else {
    await Promise.all(
      pptPath.value.map((item) => electron.ipcRenderer.invoke('createFolder', item.path))
    ).catch((e) => {
      console.error(e)
      next()
    })
    next()
  }
})
</script>

<template>
  <div id="PPTPath">
    <p>共检测到{{ courses.size }}种课程</p>
    <div style="width: 70%">
      <div v-for="item in pptPath" :key="item.subject" class="flex flex-row items-center">
        <span style="width: 4rem">{{ item.subject }}:</span>
        <n-input-group style="width: 100%">
          <n-input v-model:value="item.path" />
          <n-button @click="showOpenDialog(item.path, item.subject)">选择文件夹</n-button>
        </n-input-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
#PPTPath {
  height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
