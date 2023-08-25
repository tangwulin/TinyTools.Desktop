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
  Person24Regular as PersonIcon,
} from "@vicons/fluent";
import { DiceOutline as DiceIcon } from "@vicons/ionicons5";

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
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "randomSelection",
          },
        },
        { default: () => "随机抽选" }
      ),
    key: "randomSelection",
    icon: renderIcon(DiceIcon),
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
  <n-layout has-sider content-style="height:100vh;width:100%">
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
          <div class="flex justify-center items-center bg-gray-100">
            <img
              :src="logoUrl"
              alt="logo"
              style="width: 60%; min-width: 3rem"
            />
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

    <!--下方router-view内内容加css只能在各组件内部加-->
    <n-layout-content content-style="margin:0.5rem 0.5rem auto 0.5rem">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>
