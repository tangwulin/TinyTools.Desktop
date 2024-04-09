<script lang="ts" setup>
import { asyncComputed } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { getCharacterInfo } from '../../services/ArknightsUIService'
import { caching } from '../../services/CacheService'
import { useArknightsUIStore } from '../../stores/arknightsUI'
import { watch } from 'vue'

const arknightsUIStore = useArknightsUIStore()

const { selectedCharacterKey, selectedCharacterImageIndex } = storeToRefs(arknightsUIStore)

const characterImage = asyncComputed(async () => {
  const res = await getCharacterInfo(selectedCharacterKey.value)
  return caching(res.images[selectedCharacterImageIndex.value])
})

watch(selectedCharacterImageIndex, async () => {
  const res = await getCharacterInfo(selectedCharacterKey.value)
  characterImage.value = caching(res.images[selectedCharacterImageIndex.value])
})

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div class="w-full h-full relative flex items-center justify-center">
    <img
      :src="characterImage"
      alt="character"
      class="img"
      draggable="false"
      @click="$emit('click')"
    />
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
