<script setup lang="ts">
import { PropType } from 'vue'
import { Rate } from '../../../types/rate'

defineProps({
  rate: {
    type: Object as PropType<Rate>,
    required: true
  }
})
</script>
<template>
  <div
    style="
      width: 6rem;
      height: 6rem;
      background: #fff;
      box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
      margin: 0.5rem;
    "
  >
    <div
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "
    >
      <div class="flex flex-col items-center">
        <p style="text-align: center">{{ rate?.name }}</p>
        <n-tag :type="rate.score >= 0 ? 'info' : 'error'" size="small"
          >{{ rate?.score ?? 0 }}
        </n-tag>
        <n-p depth="3" style="font-size: 0.75rem; margin: 0">{{ rate?.description }}</n-p>
      </div>
    </div>
  </div>
</template>
