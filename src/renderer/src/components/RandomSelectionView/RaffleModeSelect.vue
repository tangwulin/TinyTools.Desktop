<script setup lang="ts">
import { Dice, DiceOutline } from '@vicons/ionicons5'
import { ref } from 'vue'

const hasHover = ref(false)
</script>
<template>
  <div
    class="flex flex-col justify-center items-center"
    style="margin: auto; width: 4rem; cursor: pointer"
    @mouseenter="hasHover = true"
    @mouseleave="hasHover = false"
  >
    <n-icon size="2rem">
      <Dice v-if="hasHover" />
      <DiceOutline v-else />
    </n-icon>
    <slot />
  </div>
</template>
