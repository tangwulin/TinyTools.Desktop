<script lang="ts" setup>
import gem from '../../../assets/images/ArknightUI/gem.png'
import money from '../../../assets/images/ArknightUI/money.png'
import stone from '../../../assets/images/ArknightUI/stone.png'
import IconAdd from '../../../components/ArknightUI/icons/Add.vue'
import { useArknightsUIStore } from '../../../stores/arknightsUI'
const arknightsUIStore = useArknightsUIStore()
</script>

<template>
  <div class="asset-info">
    <div class="item">
      <img :src="money" alt="money" class="icon" />
      <span class="number">{{ arknightsUIStore.asset.money }}</span>
    </div>
    <div class="item">
      <img :src="gem" alt="gem" class="icon" />
      <span class="number">{{ arknightsUIStore.asset.gem }}</span>
      <IconAdd class="button" />
    </div>
    <div class="item">
      <img :src="stone" alt="stone" class="icon" />
      <span class="number">{{ arknightsUIStore.asset.stone }}</span>
      <IconAdd class="button" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.asset-info {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  pointer-events: auto;
}

.asset-info::before {
  content: '';
  position: absolute;
  top: 7px;
  left: -80px;
  right: 0;
  bottom: 7px;
  background-color: rgba(0, 0, 0, 0.2);
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 30px;
  color: white;
  text-shadow: 4px 3px 2px #333;
  margin-right: 20px;

  .icon {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-right: 16px;
    filter: drop-shadow(4px 3px 2px #333);
  }

  .number {
    margin-right: 4px;
  }

  .button {
    filter: drop-shadow(4px 3px 2px #333);
  }
}
</style>
