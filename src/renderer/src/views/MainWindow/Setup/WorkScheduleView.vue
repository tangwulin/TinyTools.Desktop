<script lang="ts" setup>
import { ref } from 'vue'

const hasImported = ref(false)
</script>

<template>
  <n-card
    :bordered="false"
    style="margin: auto auto; display: flex; justify-content: center; align-items: center"
  >
    <n-table v-if="hasImported" :single-line="false">
      <thead>
        <tr></tr>
      </thead>
    </n-table>
  </n-card>
</template>

<style scoped></style>
