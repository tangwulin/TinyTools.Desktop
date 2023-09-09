<script setup>
import { ref } from 'vue'
import { usePersonStore } from '../stores/person'
import { useSettingStore } from '../stores/setting'
import { storeToRefs } from 'pinia'
import { remToPx } from '../assets/script/util'
import { getAvatar } from '../utils/AvatarUtil'

const person = usePersonStore()
const { personList } = storeToRefs(person)

const setting = useSettingStore()
const { enableAvatar } = storeToRefs(setting)

const showModal = ref(false)

const clickHandler = (person) => {
  showModal.value = true
}
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 600px"
      title="模态框"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        噢！
      </template>
      内容
      <template #footer>
        尾部
      </template>
    </n-card>
  </n-modal>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 4rem)">
      <n-scrollbar>
        <div
          style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:auto;
            "
        >
          <div
            v-for="item in personList"
            style="
                width: 8rem;
                height: 8rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
            @click="clickHandler(item)"
          >
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
                :size="remToPx(4)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
                style="margin-bottom: 0.5rem"
              />
              <span style="font-size: 1.5rem">{{ item?.name }}</span>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div
        class="flex flex-row justify-around items-center"
        style="height: 4rem"
      >

      </div>
    </n-layout-footer>
  </n-layout>
</template>

<style scoped>

</style>