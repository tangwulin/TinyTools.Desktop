<script lang="ts" setup>
import { dateZhCN, zhCN } from 'naive-ui'
</script>

<template>
  <n-config-provider :date-locale="dateZhCN" :locale="zhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
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

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: var(--n-color);
  background-image: none;
}
</style>
