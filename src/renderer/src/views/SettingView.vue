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
  Person20Regular as PersonIcon
} from "@vicons/fluent";

const settingStore = useSettingStore();
const { enableDevelopFeature } = storeToRefs(settingStore);

const activeKey = ref("playSetting");

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const settingOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "bgmSetting",
          },
        },
        { default: () => "背景音乐" }
      ),
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
    : {  }
);
</script>

<template>
  <div style="height: 100vh; width: inherit;margin: 1rem">
    <n-layout style="height: 100%">
      <n-layout-header bordered>
        <div>设置</div>
      </n-layout-header>
      <n-layout-content>
        <n-layout has-sider>
          <n-layout-sider :width="'14rem'">
            <n-menu :options="settingOptions" v-model:value="activeKey" />
          </n-layout-sider>
          <n-layout-content>
            <div class="h-full overflow-y-hidden" id="settingContainer">
              <router-view />
            </div>
          </n-layout-content>
        </n-layout>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<style scoped></style>
