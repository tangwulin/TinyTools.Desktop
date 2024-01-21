<script lang="ts" setup>
import { useNotification } from 'naive-ui'
import IconCalendar from '../../components/ArknightUI/icons/Calendar.vue'
import IconMail from '../../components/ArknightUI/icons/Mail.vue'
import IconSetting from '../../components/ArknightUI/icons/Setting.vue'
import IconWarning from '../../components/ArknightUI/icons/Warning.vue'
import { useUserStore } from '../../stores/user'
import ANMessage from './ANMessage.vue'

const notification = useNotification()
const userStore = useUserStore()

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
    <IconSetting width="48px" fill="white" class="cursor-pointer" @click="showSetting = true" />
    <IconWarning width="48px" fill="white" class="cursor-pointer" @click="handleClick1" />
    <IconMail width="48px" fill="white" class="cursor-pointer" @click="handleClick1" />
    <IconCalendar width="48px" fill="white" class="cursor-pointer" @click="handleClick1" />
  </div>

  <n-modal v-model:show="showSetting" :mask-closable="false">
    <n-card
      style="width: 600px"
      title="数据展示页设置"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showSetting = false"
    >
      <n-scrollbar style="max-height: 50vh; overflow-x: hidden">
        <n-space vertical>
          <n-space vertical style="width: 60%">
            <!--          <n-checkbox>显示干员</n-checkbox>-->
            <!--          <n-checkbox>显示干员语音</n-checkbox>-->
            <!--          <n-checkbox>显示干员语音文本</n-checkbox>-->
            <p style="font-size: 1rem">基本信息</p>
            <n-space class="items-center" justify="space-between">
              <p>名称</p>
              <n-input v-model:value="userStore.user.name" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>ID</p>
              <n-input v-model:value="userStore.user.id" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>等级</p>
              <n-input-number v-model:value="userStore.user.level" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>经验值</p>
              <n-input-number v-model:value="userStore.user.exp" />
            </n-space>
          </n-space>
        </n-space>
        <n-divider />
        <n-space vertical>
          <n-space vertical style="width: 60%">
            <p style="font-size: 1rem">资源</p>
            <n-space class="items-center" justify="space-between">
              <p>money</p>
              <n-input-number v-model:value="userStore.asset.money" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>gem</p>
              <n-input-number v-model:value="userStore.asset.gem" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>stone</p>
              <n-input-number v-model:value="userStore.asset.stone" />
            </n-space>
            <n-space class="items-center" justify="space-between">
              <p>sense</p>
              <n-input-number v-model:value="userStore.asset.sense" />
            </n-space>
          </n-space>
        </n-space>
        <n-divider />
        <n-space vertical>
          <n-space vertical style="width: 60%">
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
