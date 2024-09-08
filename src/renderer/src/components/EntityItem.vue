<script lang="ts" setup>
import { computed, PropType } from 'vue'

import { remToPx } from '../utils/styleUtil'

type Size = number | 'small' | 'medium' | 'large'

const props = defineProps({
  displayName: {
    type: String,
    required: true
  },
  enableAvatar: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String as PropType<null | string>,
    default: () => null
  },
  size: {
    type: [Number, String] as PropType<Size>,
    default: 'medium'
  }
  // onClick: {
  //   type: Function,
  //   default: () => {}
  // },
  // onHover: {
  //   type: Function,
  //   default: () => {}
  // },
  // onLeave: {
  //   type: Function,
  //   default: () => {}
  // }
})

const size = computed(() => {
  if (typeof props.size === 'number') return props.size
  else if (props.size === 'small') return remToPx(4)
  else if (props.size === 'medium') return remToPx(6)
  else if (props.size === 'large') return remToPx(8)
  else return remToPx(6)
})

const avatarSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  else if (props.size === 'small') return remToPx(2)
  else if (props.size === 'medium') return remToPx(3)
  else if (props.size === 'large') return remToPx(4)
  else return remToPx(3)
})

const fontSize = computed(() => {
  if (typeof props.size === 'number') return props.size / 3 + 'rem'
  else if (props.size === 'small') return '0.5rem'
  else if (props.size === 'medium') return '14px'
  else if (props.size === 'large') return '1.5rem'
  else return '14px'
})
</script>
<template>
  <div :style="{ width: size + 'px', height: size + 'px' }" class="entity-item">
    <div
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "
    >
      <n-avatar
        v-if="enableAvatar"
        :img-props="{ referrerpolicy: 'no-referrer' }"
        :size="avatarSize"
        :src="avatar"
        lazy
        object-fit="contain"
        round
        style="margin-bottom: 0.5rem"
      />

      <div class="flex flex-row items-center">
        <span :style="{ fontSize: fontSize }">{{ displayName }}</span>
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.entity-item {
  background: #fff;
  box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  margin: 0.5rem;
}
</style>
