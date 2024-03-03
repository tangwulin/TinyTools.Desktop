<script lang="ts" setup>
import { useNotification } from 'naive-ui'
import { h } from 'vue'
import image1 from '../../../assets/images/ArknightUI/image1.png'
import image10 from '../../../assets/images/ArknightUI/image10.png'
import mind from '../../../assets/images/ArknightUI/mind.png'
import { useArknightsUIStore } from '../../../stores/arknightsUI'

import ANMessage from '../ANMessage.vue'

const arknightsUIStore = useArknightsUIStore()
const notification = useNotification()
const handleClick1 = () => {
  notification.create({
    closable: false,
    duration: 3000,
    content: () => h(ANMessage, null, () => '开发中，敬请期待')
  })
}
</script>

<template>
  <div class="fight-row" @click="handleClick1">
    <div class="sense">
      <img :src="mind" alt="mind" class="bg" />
      <div class="current">{{ arknightsUIStore.asset.sense }}</div>
      <div class="max">理智/90</div>
    </div>
    <div class="fight">
      <div class="title">终端</div>
      <span class="tag">当前</span>
      <div class="level">{{ arknightsUIStore.fightInfo.name }}</div>
    </div>
    <div class="mark">
      <img :src="image1" alt="icon" class="icon" />
      <img :src="image10" alt="right bottom" class="right-bottom" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fight-row {
  margin-bottom: 16px;
  position: relative;
  padding: 12px;
  width: 780px;
  height: 200px;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: white;
  }

  &::before {
    content: '';
    position: absolute;
    z-index: 2;
    bottom: -2px;
    left: 300px;
    height: 5px;
    width: 380px;
    background-color: #f85711;
  }
}

.sense {
  position: relative;
  width: 240px;
  margin-right: 20px;

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .current {
    position: relative;
    font-size: 80px;
    line-height: 108px;
    padding-left: 48px;
    text-align: center;
    font-weight: bold;
    text-shadow: 5px 4px 2px #888;
    margin-bottom: 8px;
  }

  .max {
    position: relative;
    font-size: 32px;
    padding-left: 24px;
    text-align: center;
    color: white;
  }
}

.fight {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .title {
    font-size: 75px;
    font-family: 'FZSong';
    margin-bottom: 4px;
  }

  .tag {
    padding: 4px 6px;
    font-size: 24px;
    background-color: #333;
    color: white;
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .level {
    font-size: 24px;
  }
}

.mark {
  position: absolute;
  inset: 0;

  .icon {
    position: absolute;
    left: 380px;
    top: 15px;
    width: 170px;
    height: 170px;
    filter: invert(20%) drop-shadow(30px 0 0 rgba(0, 0, 0, 0.1));
  }

  .right-bottom {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 128px;
    filter: invert(50%);
    opacity: 0.3;
  }
}
</style>
