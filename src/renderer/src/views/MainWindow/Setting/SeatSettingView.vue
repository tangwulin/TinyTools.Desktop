<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import EqualityOrEquity from '../../../assets/images/equality_or_equity.png'
import config from '../../../data/raffleModes.json'
import { useSettingStore } from '../../../stores/setting'

const setting = useSettingStore()
const { lotteryMode } = storeToRefs(setting)

const raffleModes = config['raffleModes']
</script>

<template>
  <n-space :size="'large'" vertical>
    <!--    <n-space class="items-center">-->
    <!--      <p>启用旧版工具栏</p>-->
    <!--      <n-switch v-model:value="enableOldToolBar" />-->
    <!--    </n-space>-->
    <n-space vertical>
      <p>抽选座位模式</p>
      <img :src="EqualityOrEquity" alt="EqualityOrEquity" style="width: 18rem" />
      <n-radio-group v-model:value="lotteryMode">
        <n-space>
          <n-popover v-for="item in raffleModes" :key="item.value" trigger="hover">
            <template #trigger>
              <n-radio :disabled="item.disabled" :value="item.value">
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
