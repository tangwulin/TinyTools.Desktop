<script setup>
import { useSettingStore } from "../stores/setting";
import { storeToRefs } from "pinia";
import { h } from "vue";
import { NIcon } from "naive-ui";
import { RouterLink } from "vue-router";
import {
  Settings16Regular as SettingIcon,
  MusicNote220Regular as MusicIcon,
  MusicNote2Play20Regular as MusicPlayIcon,
  Person20Regular as PersonIcon,
} from "@vicons/fluent";

const settingStore = useSettingStore();
const { enableDevelopFeature } = storeToRefs(settingStore);

const activeKey = ref("seatSetting");

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const settingOptions = [
  {
    label: "通用设置",
    key: "generalSetting",
    icon: renderIcon(PersonIcon),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "seatSetting",
              },
            },
            { default: () => "抽选座位" }
          ),
        key: "seatSetting",
        icon: renderIcon(SettingIcon),
      },
    ],
  },
  {
    label: "背景音乐",
    key: "bgmSetting",
    icon: renderIcon(MusicIcon),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "playSetting",
              },
            },
            { default: () => "播放设置" }
          ),
        key: "playSetting",
        icon: renderIcon(SettingIcon),
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "playlistSetting",
                query: {
                  type: "bgm",
                },
              },
            },
            { default: () => "抽选音乐" }
          ),
        key: "bgmPlaylist",
        icon: renderIcon(MusicPlayIcon),
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "playlistSetting",
                query: {
                  type: "finalBgm",
                },
              },
            },
            { default: () => "结算音乐" }
          ),
        key: "finalBgmPlaylist",
        icon: renderIcon(MusicPlayIcon),
      },
    ],
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "personManage",
          },
        },
        { default: () => "人员管理" }
      ),
    key: "personManage",
    icon: renderIcon(PersonIcon),
  },
].concat(
  enableDevelopFeature.value
    ? {
        label: () =>
          h(
            RouterLink,
            {
              to: {
                name: "debugTool",
              },
            },
            { default: () => "调试工具" }
          ),
        key: "debugTool",
        icon: renderIcon(SettingIcon),
      }
    : []
);
</script>

<template>
  <div style="height: calc(100vh - 1rem); width: inherit;">
    <n-layout style="height: 100%">
      <n-layout-header bordered>
        <div style="margin: 0.5rem 0 0.5rem 1rem;font-size: 1rem">设置</div>
      </n-layout-header>
      <n-layout-content>
        <n-layout has-sider>
          <n-layout-sider :width="'14rem'">
            <n-menu :options="settingOptions" v-model:value="activeKey" />
          </n-layout-sider>
          <n-layout-content content-style="margin: 0.5rem 0.5rem auto auto">
<!--            <div class="h-full overflow-y-hidden" id="settingContainer">-->
<!--              -->
<!--            </div>-->
            <router-view/>
          </n-layout-content>
        </n-layout>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<style scoped></style>
