<script lang="ts" setup>
import { type ElectronAPI } from '@electron-toolkit/preload'
import { Dashboard as DashboardIcon, Group as GroupIcon } from '@vicons/carbon'
import {
  Info20Regular as InfoIcon,
  Person24Regular as PersonIcon,
  Settings16Regular as SettingIcon
} from '@vicons/fluent'
import { DiceOutline as DiceIcon } from '@vicons/ionicons5'
import { ChairAltOutlined as ChairIcon, ScoreboardOutlined as ScoreIcon } from '@vicons/material'
import { Gift as GiftIcon, Menu2 as MenuIcon } from '@vicons/tabler'
import { UpdateInfo } from 'builder-util-runtime'
import { NIcon, useDialog } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { Component, h, onBeforeMount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import backupDB from '../services/BackupService'
const router = useRouter()
import { getAppData } from '../services/DataService'
import { useGeneralStore } from '../stores/general'

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}
const dialog = useDialog()

const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

/* eslint-disable */
// noinspection TypeScriptUnresolvedReference
// @ts-ignore:2304
const version = __APP_VERSION__
/* eslint-enable */
const shortVersion = version?.split('-')[0]

const activeKey = ref(null)
const collapsed = ref(true)
const collapsedSlider = ref(false)

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
  },
  { deep: true }
)

function renderIcon(icon: Component, props?: any) {
  return () => h(NIcon, props, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () =>
      h(
        'div',
        {
          onClick: () => {
            collapsed.value = !collapsed.value
          },
          draggable: false
        },
        { default: () => (collapsed.value ? '展开' : '收起') }
      ),
    key: 'menu',
    icon: renderIcon(MenuIcon, {
      onClick: () => {
        collapsed.value = !collapsed.value
      }
    })
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'dashboard'
          },
          draggable: false
        },
        { default: () => '数据总览' }
      ),
    key: 'dashboard',
    icon: renderIcon(DashboardIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'score',
            query: { type: lastScoreType.value }
          },
          draggable: false
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
          },
          draggable: false
        },
        { default: () => '座位抽选' }
      ),
    key: 'seat',
    icon: renderIcon(ChairIcon)
  },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: {
  //           name: 'schedule'
  //         }
  //       },
  //       { default: () => '值日排班（未完成）' }
  //     ),
  //   key: 'schedule',
  //   icon: renderIcon(ScheduleIcon),
  //   show: enableDevelopFeature.value
  // },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'randomSelection'
          },
          draggable: false
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
            name: 'lottery'
          },
          draggable: false
        },
        { default: () => '幸运抽奖' }
      ),
    key: 'lottery',
    icon: renderIcon(GiftIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'personManage'
          },
          draggable: false
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
          },
          draggable: false
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
          },
          draggable: false
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
          },
          draggable: false
        },
        { default: () => '设置' }
      ),
    key: 'setting',
    icon: renderIcon(SettingIcon)
  }
]

onMounted(() => {
  if (isElectron) {
    setTimeout(() => {
      electron.ipcRenderer.send('checkForUpdates')
    }, 500)
  }
})

if (isElectron) {
  electron.ipcRenderer.on('printUpdaterMessage', (event, data) => {
    console.log('printUpdaterMessage', event, data)
  })

  // 5. 收到主进程可更新的消息，做自己的业务逻辑
  electron.ipcRenderer.on('updateAvailable', (_, info: UpdateInfo) => {
    dialog.info({
      closable: false,
      closeOnEsc: false,
      maskClosable: false,
      title: `发现新版本 ${info.version}，是否立即下载？`,
      content: info.releaseNotes as string,
      negativeText: '不更新',
      positiveText: '更新',
      onPositiveClick: () => {
        electron.ipcRenderer.send('confirmUpdate')
      },
      onNegativeClick: () => {
        // 不用做什么
      }
    })
  })

  // 6. 点击确认更新
  // electron.ipcRenderer.send('confirmUpdate')

  // 9. 收到进度信息，做进度条
  electron.ipcRenderer.on('downloadProgress', (event, data) => {
    console.log('downloadProgress', event, data)
    // do sth.
  })

  // 11. 下载完成，反馈给用户是否立即更新
  electron.ipcRenderer.on('updateDownloaded', () => {
    // do sth.
    dialog.success({
      closable: false,
      closeOnEsc: false,
      maskClosable: false,
      title: '下载已完成',
      content: '新版本文件下载完成，是否现在更新？',
      positiveText: '是',
      negativeText: '否',
      onPositiveClick: () => {
        update()
      },
      onNegativeClick: () => {
        //do nothing
      }
    })
  })
}
const beforeUpdate = async () => {
  const data = await getAppData()
  await backupDB.addBackup(data)
}

const update = async () => {
  await beforeUpdate()
  localStorage.setItem('updateFlag', String(true))
  electron.ipcRenderer.send('updateNow')
}

onBeforeMount(() => {
  const flag = localStorage.getItem('updateFlag')
  if (flag === 'true') {
    router.push({ name: 'afterupdate' })
  }
})
</script>
<template>
  <n-layout content-style="height:100vh;width:100%" has-sider>
    <n-layout-sider
      :collapsed="collapsedSlider"
      :collapsed-width="0"
      :width="collapsedWithoutAnimation ? 64 : 180"
      collapse-mode="width"
      show-trigger
      @collapse="collapsedSlider = true"
      @expand="collapsedSlider = false"
    >
      <n-layout content-style="height:100vh;width:100%" has-sider>
        <n-layout-sider
          :collapsed="collapsed"
          :collapsed-width="64"
          :width="180"
          bordered
          collapse-mode="width"
        >
          <n-layout class="h-full">
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
                style="
                  text-align: center;
                  margin: 0 0 0.25rem 0;
                  font-size: 0.75rem;
                  user-select: none;
                "
              >
                {{ collapsedWithoutAnimation ? shortVersion : version }}
              </n-p>
            </n-layout-footer>
          </n-layout>
        </n-layout-sider>
      </n-layout>
    </n-layout-sider>

    <!--下方router-view内内容加css只能在各组件内部加-->
    <n-layout-content>
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>
