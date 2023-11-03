<script lang="ts" setup>
import { useSettingStore } from '../../../stores/setting'
import { storeToRefs } from 'pinia'

import EqualityOrEquity from '../../../assets/images/equality_or_equity.png'

const setting = useSettingStore()
const { enableOldToolBar, lotteryMode } = storeToRefs(setting)

const lotteryModes = [
  {
    label: '平等',
    value: 1,
    description: '随机打乱座位，会有不尽人意的情况'
  },
  {
    label: '折中',
    value: 2,
    description: '外面一圈的人不会再次坐到外面一圈，但仍是随机排列',
    disabled: true
  },
  {
    label: '两边到中间',
    value: 3,
    description: '就像名字里说的那样',
    disabled: true
  },
  {
    label: '相对公平',
    value: 4,
    description: '通过对前几次结果的分析来决定这一次分配的位置'
  }
]
</script>

<template>
  <n-space :size="'large'" vertical>
    <n-space class="items-center">
      <p>启用旧版工具栏</p>
      <n-switch v-model:value="enableOldToolBar" />
    </n-space>
    <n-space vertical>
      <p>抽选座位模式</p>
      <img :src="EqualityOrEquity" alt="EqualityOrEquity" style="width: 18rem" />
      <n-radio-group v-model:value="lotteryMode">
        <n-space>
          <n-popover v-for="item in lotteryModes" trigger="hover">
            <template #trigger>
              <n-radio :key="item.value" :disabled="item.disabled" :value="item.value">
                {{ item.label }}
              </n-radio>
            </template>
            {{ item.description }}
          </n-popover>
        </n-space>
      </n-radio-group>
    </n-space>
  </n-space>
</template>

<style scoped></style>
