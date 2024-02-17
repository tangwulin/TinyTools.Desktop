<script lang="ts" setup>
import { useNotification } from 'naive-ui'
import { h, ref } from 'vue'
import IconCalendar from '../../components/ArknightUI/icons/Calendar.vue'
import IconMail from '../../components/ArknightUI/icons/Mail.vue'
import IconSetting from '../../components/ArknightUI/icons/Setting.vue'
import IconWarning from '../../components/ArknightUI/icons/Warning.vue'
import { getCharacterInfo, getCharacterSupportLanguages } from '../../services/ArknightsUIService'
import { useArknightsUIStore } from '../../stores/arknightsUI'
import ANMessage from './ANMessage.vue'

const notification = useNotification()
const arknightsUIStore = useArknightsUIStore()
const showSetting = ref(false)
const handleClick1 = () => {
  notification.create({
    closable: false,
    duration: 3000,
    content: () => h(ANMessage, null, () => '开发中，敬请期待')
  })
}
</script>

<template>
  <div class="header-menu space-x-4 p-3">
    <IconSetting class="cursor-pointer" fill="white" width="48px" @click="showSetting = true" />
    <IconWarning class="cursor-pointer" fill="white" width="48px" @click="handleClick1" />
    <IconMail class="cursor-pointer" fill="white" width="48px" @click="handleClick1" />
    <IconCalendar class="cursor-pointer" fill="white" width="48px" @click="handleClick1" />
  </div>

  <n-modal v-model:show="showSetting" :mask-closable="false">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 600px"
      title="数据展示页设置"
      @close="showSetting = false"
    >
      <n-scrollbar style="max-height: 50vh; overflow-x: hidden">
        <n-space vertical>
          <n-space style="width: 60%" vertical>
            <!--          <n-checkbox>显示干员</n-checkbox>-->
            <!--          <n-checkbox>显示干员语音</n-checkbox>-->
            <!--          <n-checkbox>显示干员语音文本</n-checkbox>-->
            <p style="font-size: 1rem">基本信息</p>
            <n-space class="items-center" justify="space-between">
              <p>名称</p>
              <n-input v-model:value="arknightsUIStore.user.name" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>ID</p>
              <n-input v-model:value="arknightsUIStore.user.id" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>等级</p>
              <n-input-number v-model:value="arknightsUIStore.user.level" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>经验值</p>
              <n-input-number v-model:value="arknightsUIStore.user.exp" />
            </n-space>
          </n-space>
        </n-space>
        <n-divider />
        <n-space vertical>
          <n-space style="width: 60%" vertical>
            <p style="font-size: 1rem">资源</p>
            <n-space class="items-center" justify="space-between">
              <p>龙门币</p>
              <n-input-number v-model:value="arknightsUIStore.asset.money" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>合成玉</p>
              <n-input-number v-model:value="arknightsUIStore.asset.gem" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>源石</p>
              <n-input-number v-model:value="arknightsUIStore.asset.stone" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>理智</p>
              <n-input-number v-model:value="arknightsUIStore.asset.sense" />
            </n-space>
          </n-space>
        </n-space>
        <n-divider />
        <n-space vertical>
          <n-space style="width: 60%" vertical>
            <p style="font-size: 1rem">战斗信息</p>
            <n-space class="items-center" justify="space-between">
              <p>名称</p>
              <n-input v-model:value="userStore.fightInfo.name" />
            </n-space>
          </n-space>
        </n-space>
      </n-scrollbar>
    </n-card>
  </n-modal>
</template>

<style lang="scss" scoped>
.header-menu {
  display: flex;
}
</style>
