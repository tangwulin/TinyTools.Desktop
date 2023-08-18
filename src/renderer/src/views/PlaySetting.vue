<script setup>
import { useSettingStore } from '@/stores/setting'
import { storeToRefs } from 'pinia'

const setting = useSettingStore()

const { enableBgm, enableFinalBgm, enableFadein, fadeinTime } = storeToRefs(setting)
</script>

<template>
  <div class="m-2">
    <n-space vertical>
      <n-space>
        <p>启用抽选时的背景音乐</p>
        <n-switch v-model:value="enableBgm"/>
      </n-space>
      <n-space>
        <p>启用抽选完成时的背景音乐</p>
        <n-switch v-model:value="enableFinalBgm"/>
      </n-space>
      <n-space>
        <p>启用音乐淡入</p>
        <n-switch v-model:value="enableFadein"/>
      </n-space>
      <n-space class="flex justify-center items-center">
        <p>音乐淡入时间</p>
        <n-input-number v-model:value="fadeinTime">
          <template #suffix>
            秒
          </template>
        </n-input-number>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>

</style>