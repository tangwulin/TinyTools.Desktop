<script lang="ts" setup>
import Level from '../../components/ArknightUI/Level.vue'
import { useUserStore } from '../../stores/user'
import rhodesIsland from '../../assets/images/ArknightUI/rhodes-island.png'

const userStore = useUserStore()
</script>

<template>
  <div class="user-info">
    <img class="logo" :src="rhodesIsland" alt="罗德岛" />
    <div class="rect"></div>
    <div class="text">
      <div class="name">{{ userStore.user.name }}</div>
      <div class="uid">ID: {{ userStore.user.id }}</div>
    </div>
    <Level :level="userStore.user.level" :percent="userStore.user.exp" />
  </div>
</template>

<style lang="scss" scoped>
.user-info {
  position: absolute;
  width: 15%;
  top: 50%;
  color: white;
}

.logo {
  position: absolute;
  transform: translateY(-50%);
  width: 230px;
  right: 0;
  filter: brightness(50%);
}

.rect {
  position: absolute;
  transform: translateY(-50%);
  width: 110%;
  right: 0;
  height: 42px;
  background-color: #323232;
  box-shadow: 0 0 10px 0 #111111;
}

.text {
  position: absolute;
  top: 26px;
  right: 0;
  cursor: pointer;
  text-align: right;
}

.name {
  font-size: 2.6rem;
  font-weight: bold;
  white-space: nowrap;
}

.uid {
  white-space: nowrap;
}

.level {
  position: absolute;
  right: 0;
  bottom: -10px;
}
</style>
