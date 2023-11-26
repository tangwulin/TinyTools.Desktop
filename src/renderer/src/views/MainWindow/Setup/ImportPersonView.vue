<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import PersonManage from '../PersonManage.vue'

onBeforeRouteLeave(() => {})
</script>

<template>
  <div class="flex justify-center items-center" style="height: 100%">
    <div style="height: 100%; overflow: hidden">
      <person-manage />
    </div>
  </div>
</template>

<style scoped></style>
