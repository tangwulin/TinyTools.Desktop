<script lang="ts" setup>
import image10 from '../../../assets/images/ArknightUI/image10.png'
import image2 from '../../../assets/images/ArknightUI/image2.png'
import image3 from '../../../assets/images/ArknightUI/image3.png'
import router from '../../../router'
</script>

<template>
  <div class="team-row">
    <div class="item" @click="router.push({ name: 'groupManage' })">
      <div class="title">编队</div>
      <img :src="image2" alt="icon" class="icon" />
      <img :src="image10" alt="right bottom" class="right-bottom" />
    </div>
    <div class="item" @click="router.push({ name: 'personManage' })">
      <div class="title">干员</div>
      <div class="sub">角色管理</div>
      <img :src="image3" alt="icon" class="icon" />
      <img :src="image10" alt="right bottom" class="right-bottom" />
    </div>
    <div class="black"></div>
  </div>
</template>

<style lang="scss" scoped>
.team-row {
  position: relative;
  margin-bottom: 16px;
  width: 740px;
  display: flex;
  transform: translateX(-40px);
  pointer-events: auto;
}

.item {
  position: relative;
  padding: 16px;
  flex: 1;
  height: 140px;
  background-color: rgba(255, 255, 255, 0.9);
  margin-right: 20px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: white;
  }

  .title {
    font-family: 'FZSong';
    font-size: 60px;
    color: #333;
  }

  .sub {
    font-size: 24px;
    color: #9a9a9a;
  }
}

.icon {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 108px;
  height: 108px;
  filter: invert(15%);
}

.right-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 128px;
  filter: invert(50%);
  opacity: 0.3;
}

.black {
  position: absolute;
  top: 0;
  left: 100%;
  width: 150px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
