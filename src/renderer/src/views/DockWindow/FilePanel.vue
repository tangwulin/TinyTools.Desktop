<script lang="ts" setup>
import type { ElectronAPI } from '@electron-toolkit/preload'
import { Stats } from 'node:fs'
import { ref } from 'vue'

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
const getFileList = async () => {
  if (!isElectron) {
    console.error('Not in electron')
    return
  }
  electron.ipcRenderer
    .invoke('getFileList', ['D:\\Users\\34986\\OneDrive - tangwulin\\桌面'])
    .then(async (res) => {
      list.value = res.map((item) => {
        return {
          ...item,
          thumbnail: 'filethumbnail://' + item.path
        }
      })
    })
}
getFileList()
</script>

<template>
  <n-scrollbar style="height: calc(100vh - 1rem)">
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
</template>

<style scoped>
.file-thumbnail {
  object-fit: scale-down;
  aspect-ratio: 1;
  padding: 0.5rem;
}
</style>
