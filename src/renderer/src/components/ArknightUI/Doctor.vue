<script lang="ts" setup>
import doctor from '../../assets/images/ArknightUI/doctor.png'
</script>

<template>
  <div class="w-full h-full relative flex items-center justify-center">
    <img :src="doctor" alt="doctor" class="img" />
  </div>
</template>

<style lang="scss" scoped>
.img {
  width: 90px;
  position: relative;
  left: -32%;
  top: 4%;
}
</style>
