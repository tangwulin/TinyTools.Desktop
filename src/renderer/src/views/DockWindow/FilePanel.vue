<script lang="ts" setup>
import type { ElectronAPI } from '@electron-toolkit/preload'
import { Stats } from 'node:fs'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useCourseStore } from '../../stores/course'

const courseStore = useCourseStore()
const { thisCourse, nextCourse, pptPath } = storeToRefs(courseStore)

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

const list = ref<
  {
    name: string
    path: string
    stats: Stats
    thumbnail: string
  }[]
>([])
const getFileList = async (path: string) => {
  if (!isElectron) {
    console.error('Not in electron')
    return
  }
  electron.ipcRenderer.invoke('getFileList', path).then(async (res) => {
    const result = res
      .map((item) => {
        return {
          ...item,
          thumbnail: 'filethumbnail://' + encodeURI(item.path)
        }
      })
      .filter((item) => !item.name.startsWith('.'))
    console.log(result)
    list.value = result
  })
}

watch([() => thisCourse.value, () => nextCourse.value], () => {
  if (thisCourse.value) {
    getFileList(pptPath.value.find((item) => item.subject === thisCourse.value)!.path)
  } else {
    if (!nextCourse.value) return
    getFileList(pptPath.value.find((item) => item.subject === nextCourse.value)!.path)
  }
})
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <n-scrollbar v-if="list.length !== 0" style="height: calc(100vh - 1rem)">
      <div class="grid grid-cols-6">
        <div
          v-for="file in list"
          :key="file.name"
          class="file-item flex flex-col"
          style="aspect-ratio: 1"
        >
          <img :alt="file.name" :src="file.thumbnail" class="file-thumbnail" loading="lazy" />
          <n-ellipsis
            :tooltip="false"
            expand-trigger="click"
            line-clamp="1"
            style="font-size: 0.5rem; margin: 0.25rem"
          >
            {{ file.name }}
          </n-ellipsis>
        </div>
      </div>
    </n-scrollbar>
    <p v-else>无文件</p>
  </div>
</template>

<style scoped>
.file-thumbnail {
  object-fit: scale-down;
  aspect-ratio: 1;
  padding: 0.5rem;
}
</style>
