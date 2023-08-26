<script setup>
import { useSettingStore } from "../../stores/setting";
import { storeToRefs } from "pinia";

import EqualityOrEquity from "../../assets/images/equality_or_equity.png";

const setting = useSettingStore();
const { enableOldToolBar, lotteryMode } = storeToRefs(setting);

const lotteryModes = [
  {
    label: "平等",
    value: "equality",
    description: "随机打乱座位，会有不尽人意的情况",
  },
  {
    label: "折中",
    value: "or",
    description: "外面一圈的人不会再次坐到外面一圈，但仍是随机排列",
  },
  {
    label: "公平（未实现）",
    value: "equity",
    description: "通过对前几次结果的分析来决定这一次分配的位置",
    disabled:true,
  },
];
</script>

<template>
  <n-space vertical :size="'large'">
    <n-space class="items-center">
      <p>启用旧版工具栏</p>
      <n-switch v-model:value="enableOldToolBar" />
    </n-space>
    <n-space vertical>
      <p>抽选座位模式</p>
      <img :src="EqualityOrEquity" alt="EqualityOrEquity" style="width: 18rem"/>
      <n-radio-group v-model:value="lotteryMode">
        <n-space>
          <n-popover trigger="hover" v-for="item in lotteryModes">
            <template #trigger>
              <n-radio :key="item.value" :value="item.value" :disabled="item.disabled">
                {{ item.label }}
              </n-radio>
            </template>
            {{ item.description }}
          </n-popover>
        </n-space>
      </n-radio-group>
    </n-space>
  </n-space>
</template>

<style scoped></style>
