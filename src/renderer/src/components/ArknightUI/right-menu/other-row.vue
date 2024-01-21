<script lang="ts" setup>
import { useNotification } from 'naive-ui'
import image10 from '../../../assets/images/ArknightUI/image10.png'
import image7 from '../../../assets/images/ArknightUI/image7.png'
import image8 from '../../../assets/images/ArknightUI/image8.png'
import image9 from '../../../assets/images/ArknightUI/image9.png'
import ANMessage from '../ANMessage.vue'
import { h } from 'vue'

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
  <div class="other-row">
    <div class="task" @click="handleClick1">
      <div class="title">任务</div>
      <img class="icon" :src="image8" alt="icon" />
      <img class="right-bottom" :src="image10" alt="right bottom" />
    </div>
    <div class="hostel" @click="handleClick1">
      <div class="title">基建</div>
      <div class="sub">BETA</div>
      <img class="icon" :src="image7" alt="icon" />
      <img class="right-bottom" :src="image10" alt="right bottom" />
    </div>
    <div class="depository" @click="handleClick1">
      <div class="title">仓库</div>
      <img class="icon" :src="image9" alt="icon" />
      <img class="right-bottom" :src="image10" alt="right bottom" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.other-row {
  display: flex;
  pointer-events: auto;
}

.task,
.hostel {
  position: relative;
  padding: 16px;
  width: 280px;
  height: 140px;
  background-color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: white;
  }

  .title {
    font-family: 'FZSong';
    font-size: 60px;
    color: #333;
    line-height: 1;
  }

  .sub {
    font-family: 'NovecentoSansWide';
    color: #f85711;
    font-weight: bold;
  }

  .icon {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 108px;
    height: 108px;
    filter: invert(15%);
  }
}

.right-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 128px;
  filter: invert(50%);
  opacity: 0.3;
}

.task {
  margin-right: 20px;

  &::before {
    position: absolute;
    z-index: 2;
    content: '';
    top: -2px;
    left: 20%;
    width: 60%;
    height: 5px;
    background-color: #f85711;
  }
}

.depository {
  position: relative;
  width: 120px;
  height: 140px;
  background-color: #323232;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4b4b4b;
  }

  .title {
    padding-top: 20px;
    color: white;
    font-size: 40px;
    font-family: 'FZSong';
    text-align: center;
  }

  .icon {
    position: absolute;
    bottom: 16px;
    left: 24px;
    width: 72px;
    opacity: 0.2;
  }
}
</style>
