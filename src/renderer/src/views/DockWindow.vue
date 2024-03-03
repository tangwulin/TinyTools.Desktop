<script lang="ts" setup>
import FilePanel from './DockWindow/FilePanel.vue'
</script>

<template>
  <div id="dock" class="text-white flex flex-row justify-around">
    <div class="w-1/5 border-2 border-black" style="-webkit-app-region: drag">按住拖动</div>
    <div class="w-1/2 border-2 border-black">
      <file-panel />
    </div>
    <div class="w-1/4 border-2 border-black">
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
}
</style>
