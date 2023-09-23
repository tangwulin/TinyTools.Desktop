<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
</script>

<template>
  <n-config-provider :date-locale="dateZhCN" :locale="zhCN">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
@font-face {
  font-family: 'HYWenHei-85W';
  src: url('./assets/fonts/HYWenHei-85W.ttf') format('truetype');
}

body {
  font-family: 'HYWenHei-85W', sans-serif;
  background: transparent;
}
</style>
