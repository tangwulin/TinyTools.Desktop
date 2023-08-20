<script setup>
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
import { NIcon } from "naive-ui";
import { ChairAltOutlined as ChairIcon } from "@vicons/material";
import { ScheduleOutlined as ScheduleIcon } from "@vicons/antd";
import {
  DataHistogram24Regular as DataIcon,
  Settings16Regular as SettingIcon,
  Info20Regular as InfoIcon,
} from "@vicons/fluent";

import logoUrl from "../assets/images/logo.png";

const activeKey = ref("seat");
const collapsed = ref(true);

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "dashboard",
          },
        },
        { default: () => "数据总览" }
      ),
    key: "dashboard",
    icon: renderIcon(DataIcon),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "seat",
          },
        },
        { default: () => "座位抽选" }
      ),
    key: "seat",
    icon: renderIcon(ChairIcon),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "schedule",
          },
        },
        { default: () => "值日排班" }
      ),
    key: "schedule",
    icon: renderIcon(ScheduleIcon),
  },
];

const footerMenuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "about",
          },
        },
        { default: () => "关于" }
      ),
    key: "about",
    icon: renderIcon(InfoIcon),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "setting",
          },
        },
        { default: () => "设置" }
      ),
    key: "setting",
    icon: renderIcon(SettingIcon),
  },
];
</script>

<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="180"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-layout class="h-full">
        <n-layout-header>
          <div class="flex justify-center items-center bg-gray-200">
            <img :src="logoUrl" alt="logo" style="width: 60%" />
          </div>
        </n-layout-header>
        <n-layout-content>
          <n-menu
            v-model:value="activeKey"
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="20"
            :options="menuOptions"
          />
<!--          <n-divider />-->
        </n-layout-content>
        <n-layout-footer position="absolute">
          <n-menu
            v-model:value="activeKey"
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="20"
            :options="footerMenuOptions"
          />
        </n-layout-footer>
      </n-layout>
    </n-layout-sider>

    <!--      此处为避免座位表页面出现左右显示不对称的情况，故不能将直接套一个height:100vh的div-->
    <!--      需要给内层组件统一套一个height:100vh的div-->
    <router-view />
  </n-layout>
</template>

<style scoped></style>
