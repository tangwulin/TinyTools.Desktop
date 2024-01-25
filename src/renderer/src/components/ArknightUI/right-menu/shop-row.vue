<script lang="ts" setup>
import { useNotification } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import image10 from '../../../assets/images/ArknightUI/image10.png'
import image11 from '../../../assets/images/ArknightUI/image11.png'
import image4 from '../../../assets/images/ArknightUI/image4.png'
import image5 from '../../../assets/images/ArknightUI/image5.png'
import image6 from '../../../assets/images/ArknightUI/image6.png'
import ANMessage from '../ANMessage.vue'

const router = useRouter()
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
  <div class="shop-row">
    <div class="left" @click="handleClick1">
      <div class="title">采购中心</div>
      <img :src="image6" alt="icon" class="icon" />
      <img :src="image10" alt="right bottom" class="right-bottom" />
    </div>
    <div class="right">
      <div class="top">
        <img :src="image11" alt="icon" class="icon" />
        <div class="title">招募</div>
      </div>
      <div class="bottom">
        <div
          class="item mr-1"
          @click="router.push({ name: 'personManage', query: { showAddModal: 'true' } })"
        >
          <div class="title">公开招募</div>
          <img :src="image4" alt="icon" class="icon" />
          <img :src="image10" alt="right bottom" class="right-bottom" />
        </div>
        <div class="item" @click="router.push({ name: 'randomSelection' })">
          <div class="title">干员寻访</div>
          <img :src="image5" alt="icon" class="icon" />
          <img :src="image10" alt="right bottom" class="right-bottom" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shop-row {
  margin-bottom: 16px;
  display: flex;
  color: white;
  transform: translateX(60px);
  pointer-events: auto;
}

.left,
.right {
  height: 140px;
  background-color: rgba(10, 172, 223, 0.9);
}

.left {
  position: relative;
  width: 280px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgb(10, 172, 223);
  }

  .title {
    font-family: 'FZSong';
    font-size: 52px;
    text-align: center;
    padding-top: 40px;
  }

  .icon {
    position: absolute;
    right: 12px;
    bottom: 12px;
    width: 108px;
    opacity: 0.3;
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

.right {
  width: 400px;
  padding: 4px;
}

.top {
  display: flex;
  background-color: #323232;
  height: 36px;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4b4b4b;
  }

  .icon {
    margin: 0 10px;
    width: 20px;
    height: 20px;
    filter: invert(50%);
  }

  .title {
    font-size: 24px;
    text-shadow: 4px 3px 2px #333;
  }
}

.bottom {
  display: flex;
  height: 96px;

  .item {
    flex: 1;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 10px 0px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgb(10, 172, 223);
    }

    .title {
      font-family: 'FZSong';
      font-size: 40px;
      text-align: center;
      padding-top: 30px;
    }

    .icon {
      position: absolute;
      left: 8px;
      top: 16px;
      width: 70px;
      opacity: 0.3;
    }
  }
}
</style>
