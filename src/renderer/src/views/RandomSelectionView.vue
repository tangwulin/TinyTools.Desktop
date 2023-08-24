<script setup>
import { DiceOutline } from "@vicons/ionicons5";
</script>

<template>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 6rem)">
      <div class="flex flex-row justify-center items-center h-full">
        <n-p depth="3"> 还没有抽选…… </n-p>
      </div>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 1rem 0" />
      <div
        style="height: 6rem"
        class="flex flex-row justify-around items-center"
      >
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
        >
          <n-icon size="2rem">
            <DiceOutline />
          </n-icon>
          <span>快速开始</span>
        </div>
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
        >
          <n-icon size="2rem">
            <DiceOutline />
          </n-icon>
          <span>高级选项</span>
        </div>
      </div>
    </n-layout-footer>
  </n-layout>

  <n-modal> </n-modal>
</template>

<style scoped></style>
