<script setup>
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/stores/setting'
import { InfoFilled } from '@vicons/material'

const setting = useSettingStore()

const { enableQuickSave } = storeToRefs(setting)

</script>

<template>
  <div class="m-2">
    <n-space>
      <p>是否启用快捷保存</p>
      <n-switch v-model:value="enableQuickSave"/>
      <n-popover trigger="hover" placement="right" :duration="500">
        <template #trigger>
          <n-icon size="1.5em">
            <info-filled/>
          </n-icon>
        </template>
        <span>决定直接按保存按钮有没有反应，默认会记住上一次的分辨率选择</span>
      </n-popover>
    </n-space>
  </div>
</template>

<style scoped>

</style>