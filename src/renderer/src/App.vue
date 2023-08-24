<script setup>
import { dateZhCN, zhCN } from "naive-ui";
</script>
<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
@font-face {
  font-family: "CustomFont";
  src: url("./assets/fonts/zh-cn.ttf") format("truetype");
}

body {
  font-family: "CustomFont", sans-serif;
  background: transparent;
}
</style>
