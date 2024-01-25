<script lang="ts" setup>
import { dateZhCN, GlobalThemeOverrides, NConfigProvider, zhCN } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  Notification: {
    padding: '0'
  }
}
</script>

<template>
  <n-config-provider :date-locale="dateZhCN" :locale="zhCN" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <router-view />
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style>
.n-notification {
  padding: 0;
}

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
