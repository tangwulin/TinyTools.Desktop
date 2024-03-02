<script lang="ts" setup>
import { UserAvatar as AvatarIcon } from '@vicons/carbon'
import {
  MusicNote220Regular as MusicIcon,
  MusicNote2Play20Regular as MusicPlayIcon,
  Person20Regular as PersonIcon,
  Settings16Regular as SettingIcon
} from '@vicons/fluent'
import { Database as DataIcon } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { h, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingStore } from '../../stores/setting'

const settingStore = useSettingStore()
const { enableDevelopFeature } = storeToRefs(settingStore)

const activeKey = ref('seatSetting')

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const settingOptions = [
  {
    label: '通用设置',
    key: 'generalSetting',
    icon: renderIcon(PersonIcon),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'seatSetting'
              }
            },
            { default: () => '抽选座位' }
          ),
        key: 'seatSetting',
        icon: renderIcon(SettingIcon)
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'avatarSetting'
              }
            },
            { default: () => '头像设置' }
          ),
        key: 'avatarSetting',
        icon: renderIcon(AvatarIcon)
      }
    ]
  },
  {
    label: '背景音乐',
    key: 'bgmSetting',
    icon: renderIcon(MusicIcon),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'playSetting'
              }
            },
            { default: () => '播放设置' }
          ),
        key: 'playSetting',
        icon: renderIcon(SettingIcon)
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'playlistSetting',
                query: {
                  type: 'bgm'
                }
              }
            },
            { default: () => '抽选音乐' }
          ),
        key: 'bgmPlaylist',
        icon: renderIcon(MusicPlayIcon)
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: 'playlistSetting',
                query: {
                  type: 'finalBgm'
                }
              }
            },
            { default: () => '结算音乐' }
          ),
        key: 'finalBgmPlaylist',
        icon: renderIcon(MusicPlayIcon)
      }
    ]
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'dataSetting'
          }
        },
        { default: () => '数据管理' }
      ),
    key: 'dataSetting',
    icon: renderIcon(DataIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: 'debugTool'
          }
        },
        { default: () => '调试工具' }
      ),
    key: 'debugTool',
    icon: renderIcon(SettingIcon),
    show: enableDevelopFeature.value
  }
]
</script>

<template>
  <div style="height: calc(100vh - 1rem); width: inherit">
    <n-layout style="height: 100%">
      <n-layout-header bordered>
        <div style="margin: 0 0 0.5rem 0.5rem; font-size: 1rem">设置</div>
      </n-layout-header>
      <n-layout-content>
        <n-layout has-sider>
          <n-layout-sider :width="'14rem'">
            <n-menu v-model:value="activeKey" :options="settingOptions" />
          </n-layout-sider>
          <n-layout-content content-style="margin: 0.5rem auto auto auto">
            <n-scrollbar style="max-height: calc(100vh - 4rem - 1px)">
              <router-view />
            </n-scrollbar>
          </n-layout-content>
        </n-layout>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<style scoped></style>
