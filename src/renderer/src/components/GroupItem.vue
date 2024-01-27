<script setup lang="ts">
import { PropType } from 'vue'
import { Group } from '../types/group'
import { remToPx } from '../utils/styleUtil'

type Avatar = string | null

defineProps({
  group: {
    type: Object as PropType<Group>,
    required: true
  },
  enableAvatar: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String as PropType<Avatar>,
    default: () => null
  },
  membersAvatar: {
    type: Array as PropType<{ src: string | null; name: string }[]>,
    default: () => []
  }
})

const createDropdownOptions = (options) =>
  options.map((option) => ({
    key: option.name,
    label: option.name
  }))
</script>
<template>
  <div
    style="
      width: 12rem;
      height: 6rem;
      background: #fff;
      box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
      border-radius: 1rem;
      margin: 0.5rem;
    "
  >
    <div
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin: 0 0.5rem;
      "
    >
      <n-avatar
        v-if="enableAvatar"
        :size="remToPx(3)"
        :src="avatar"
        lazy
        object-fit="contain"
        round
      />
      <div class="mx-auto flex flex-col" style="font-size: 0.75rem">
        <span>{{ group?.name }}</span>
        <n-space justify="space-between"
          ><span>{{ group?.membersID.length }}人</span>
          <n-tag :bordered="false" size="small">{{ group.score ?? 0 }}</n-tag>
        </n-space>
        <n-avatar-group v-if="enableAvatar" :max="5" :options="membersAvatar" :size="remToPx(2)">
          <template #avatar="{ option: { name, src } }">
            <n-tooltip>
              <!--suppress VueUnrecognizedSlot -->
              <template #trigger>
                <n-avatar
                  :img-props="{ referrerpolicy: 'no-referrer' }"
                  :src="src"
                  lazy
                  object-fit="contain"
                  round
                />
              </template>
              {{ name }}
            </n-tooltip>
          </template>
          <template #rest="{ options: restOptions, rest }">
            <n-dropdown
              :options="createDropdownOptions(restOptions)"
              arrow-style="overflow: hidden;"
              placement="top"
              style="overflow: hidden"
            >
              <n-avatar style="font-size: 0.75rem">+{{ rest }}</n-avatar>
            </n-dropdown>
          </template>
        </n-avatar-group>
      </div>
    </div>
  </div>
</template>
