<script setup>
import { useGroupStore } from '../../stores/group'
import { useSettingStore } from '../../stores/setting'
import { usePersonStore } from '../../stores/person'
import { useScoreStore } from '../../stores/score'
import { useSeatStore } from '../../stores/seat'

const groupStore = useGroupStore()
const settingStore = useSettingStore()
const personStore = usePersonStore()
const scoreStore = useScoreStore()
const seatStore = useSeatStore()

const exportData = () => {
  const data = {
    version: '3.99.1-beta.9',
    data: {
      group: groupStore,
      setting: settingStore,
      person: personStore,
      score: scoreStore,
      seat: seatStore,
    },
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const a = document.createElement('a')
  a.download = 'data.json'
  a.href = URL.createObjectURL(blob)
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <p>数据导出</p>
    <n-button type="primary" @click="exportData">导出为JSON</n-button>
  </div>
</template>

<style scoped>

</style>