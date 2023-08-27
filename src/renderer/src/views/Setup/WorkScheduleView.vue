<script setup>
import { ref, watch } from "vue";

const hasImported = ref(false);
</script>

<template>
  <n-card
    style="margin: auto auto;display: flex;justify-content: center;align-items: center"
    :bordered="false"
  >
    <n-table :single-line="false" v-if="hasImported">
      <thead>
      <tr>
      </tr>
      </thead>
    </n-table>
  </n-card>
</template>

<style scoped>

</style>