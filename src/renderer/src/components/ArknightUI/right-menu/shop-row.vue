<script lang="ts" setup>
import image6 from '../../../assets/images/ArknightUI/image6.png'
import image10 from '../../../assets/images/ArknightUI/image10.png'
import image11 from '../../../assets/images/ArknightUI/image11.png'
import image4 from '../../../assets/images/ArknightUI/image4.png'
import image5 from '../../../assets/images/ArknightUI/image5.png'
</script>

<template>
  <div class="shop-row">
    <div class="left">
      <div class="title">采购中心</div>
      <img class="icon" :src="image6" alt="icon" />
      <img class="right-bottom" :src="image10" alt="right bottom" />
    </div>
    <div class="right">
      <div class="top">
        <img class="icon" :src="image11" alt="icon" />
        <div class="title">招募</div>
      </div>
      <div class="bottom">
        <div class="item mr-1">
          <div class="title">公开招募</div>
          <img class="icon" :src="image4" alt="icon" />
          <img class="right-bottom" :src="image10" alt="right bottom" />
        </div>
        <div class="item">
          <div class="title">干员寻访</div>
          <img class="icon" :src="image5" alt="icon" />
          <img class="right-bottom" :src="image10" alt="right bottom" />
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
