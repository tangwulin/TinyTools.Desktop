<script setup>

</script>
<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
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
