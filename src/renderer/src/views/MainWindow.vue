<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { NIcon } from 'naive-ui'
import { ChairAltOutlined as ChairIcon, ScoreboardOutlined as ScoreIcon } from '@vicons/material'
import { ScheduleOutlined as ScheduleIcon } from '@vicons/antd'
import {
  DataHistogram24Regular as DataIcon,
  Info20Regular as InfoIcon,
  Person24Regular as PersonIcon,
  Settings16Regular as SettingIcon
} from '@vicons/fluent'
import { Group as GroupIcon } from '@vicons/carbon'
import { DiceOutline as DiceIcon } from '@vicons/ionicons5'
import { useSettingStore } from '../stores/setting'
import { storeToRefs } from 'pinia'
import logoUrl from '../assets/images/logo.png'
import { useGeneralStore } from '../stores/general'

const settingStore = useSettingStore()
const { enableDevelopFeature } = storeToRefs(settingStore)

const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

const version = __APP_VERSION__
const shortVersion = version?.split('-')[0]

const activeKey = ref(null)
const collapsed = ref(true)

const collapsedWithoutAnimation = ref(true)
watch(
  () => collapsed.value,
  (value) => {
    if (value) {
      setTimeout(() => {
        collapsedWithoutAnimation.value = true
      }, 50)
    } else {
      setTimeout(() => {
        collapsedWithoutAnimation.value = false
      }, 100)
    }
  }
)

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'dashboard'
          }
        },
        { default: () => '数据总览（未完成）' }
      ),
    key: 'dashboard',
    icon: renderIcon(DataIcon),
    show: enableDevelopFeature.value
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'score',
            query: { type: lastScoreType.value }
          }
        },
        { default: () => '评分' }
      ),
    key: 'score',
    icon: renderIcon(ScoreIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'seat'
          }
        },
        { default: () => '座位抽选' }
      ),
    key: 'seat',
    icon: renderIcon(ChairIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'schedule'
          }
        },
        { default: () => '值日排班（未完成）' }
      ),
    key: 'schedule',
    icon: renderIcon(ScheduleIcon),
    show: enableDevelopFeature.value
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'randomSelection'
          }
        },
        { default: () => '随机抽选' }
      ),
    key: 'randomSelection',
    icon: renderIcon(DiceIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'personManage'
          }
        },
        { default: () => '人员管理' }
      ),
    key: 'personManage',
    icon: renderIcon(PersonIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'groupManage'
          }
        },
        { default: () => '分组管理' }
      ),
    key: 'groupManage',
    icon: renderIcon(GroupIcon)
  }
]

const footerMenuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'about'
          }
        },
        { default: () => '关于' }
      ),
    key: 'about',
    icon: renderIcon(InfoIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'setting'
          }
        },
        { default: () => '设置' }
      ),
    key: 'setting',
    icon: renderIcon(SettingIcon)
  }
]
</script>

<template>
  <n-layout content-style="height:100vh;width:100%" has-sider>
    <n-layout-sider
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="180"
      bordered
      collapse-mode="width"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-layout class="h-full">
        <n-layout-header>
          <div class="flex justify-center items-center bg-gray-100">
            <img :src="logoUrl" alt="logo" style="width: 60%; min-width: 3rem" />
          </div>
        </n-layout-header>
        <n-layout-content>
          <n-menu
            v-model:value="activeKey"
            :collapsed="collapsed"
            :collapsed-icon-size="20"
            :collapsed-width="64"
            :options="menuOptions"
          />
          <!--          <n-divider />-->
        </n-layout-content>
        <n-layout-footer position="absolute">
          <n-menu
            v-model:value="activeKey"
            :collapsed="collapsed"
            :collapsed-icon-size="20"
            :collapsed-width="64"
            :options="footerMenuOptions"
            style="padding: 0"
          />
          <n-p
            depth="3"
            style="text-align: center; margin: 0 0 0.25rem 0; font-size: 0.75rem; user-select: none"
          >
            {{ collapsedWithoutAnimation ? shortVersion : version }}
          </n-p>
        </n-layout-footer>
      </n-layout>
    </n-layout-sider>

    <!--下方router-view内内容加css只能在各组件内部加-->
    <n-layout-content content-style="padding:0.25rem 0.25rem 0 0.25rem">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>
