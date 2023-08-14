<script setup>
import { ref } from 'vue'
import PlaySetting from './PlaySetting.vue'
import BgmSetting from '../components/BgmSetting.vue'
import FinalBgmSetting from '../components/FinalBgmSetting.vue'

const component = ref(PlaySetting)
const handleUpdateValue = (key) => {
  switch (key) {
    case 'PlaySetting':
      component.value = PlaySetting
      break
    case 'BgmSetting':
      component.value = BgmSetting
      break
    case 'FinalBgmSetting':
      component.value = FinalBgmSetting
      break
  }
}
const menuOptions = [
  {
    label: '播放设置',
    key: 'PlaySetting'
  },
  {
    label: '抽选音乐',
    key: 'BgmSetting'
  },
  {
    label: '结算音乐',
    key: 'FinalBgmSetting'
  }
]
</script>

<template>
  <div style="padding: 0 0.5rem">
    <n-space large class="bg-gray-200 rounded">
      <n-button text v-for="item in menuOptions" @click="handleUpdateValue(item.key)">
        {{ item.label }}
      </n-button>
    </n-space>
  </div>
  <div id="bgmSettingContainer" style="height: 100%">
    <component :is="component" />
  </div>
</template>

<style scoped></style>
