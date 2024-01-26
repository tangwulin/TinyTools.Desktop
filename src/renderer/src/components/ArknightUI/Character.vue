<script lang="ts" setup>
import character from '../../assets/images/ArknightUI/character.png'

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div class="w-full h-full relative flex items-center justify-center">
    <img :src="character" alt="character" class="img" draggable="false" @click="$emit('click')" />
  </div>
</template>

<style lang="scss" scoped>
.img {
  width: 800px;
  position: relative;
  top: 15%;
  left: -10%;
}
</style>
