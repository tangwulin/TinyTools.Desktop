<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    default: 'info'
  },
  top: {
    type: Number,
    default: 0
  },
  children: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
    :style="{ top: props.top + 'px', 'margin-left': -8 + 'px' }"
    :class="`ac-message ${props.type}`"
  >
    <i
      :class="`ac-message-icon iconfont icon-circle-${props.type}`"
      style="height: 40px; display: block"
    />
    <div style="font-size: 20px;">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.iconfont {
  &::before {
    position: relative;
    top: -12px;
  }
}

.ac-message {
  padding: 10px;
  box-shadow: 0 4px 10px black;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;

  &.hide {
    opacity: 0;
    transform: translateX(100%);
  }

  &.warning {
    color: orange;

    &::after {
      background-image: url('../../assets/images/ArknightUI/dot-orange-horizontal.png');
    }
  }

  &.error {
    color: red;

    &::after {
      background-image: url('../../assets/images/ArknightUI/dot-red-horizontal.png');
    }
  }

  &.success {
    color: green;

    &::after {
      background-image: url('../../assets/images/ArknightUI/dot-green-horizontal.png');
    }
  }

  &::after {
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.4;
    background-image: url('../../assets/images/ArknightUI/dot-white-horizontal.png');
    background-size: 150px auto;
    background-repeat: repeat-y;
    position: absolute;
  }
}

.ac-message-icon {
  font-size: 40px;
  margin: 0 10px;
}
</style>
