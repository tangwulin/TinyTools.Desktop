<script lang="ts" setup>
import LeftPanel from '../components/Dock/LeftPanel/Index.vue'
import FilePanel from './DockWindow/FilePanel.vue'
</script>

<template>
  <div id="dock" class="text-white">
    <!--    style="-webkit-app-region: drag"-->
    <div class="mx-2 p-2 border-2 border-black">
      <LeftPanel />
    </div>
    <div class="mx-2 border-2 border-black">
      <FilePanel />
    </div>
    <div class="mx-2 border-2 border-black">
      <p>右侧</p>
    </div>
  </div>
</template>

<style scoped>
#dock {
  background-color: rgba(0, 0, 0, 0.4);
  height: 100vh;
  width: 100vw;
  border-radius: 0.5rem;
  border-width: 0.5rem;
  border-color: rgba(87, 87, 87, 0);
  display: grid;
  grid-template-columns: max-content 60% auto;
}
</style>
