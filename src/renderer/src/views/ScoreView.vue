<script setup>
import { ref } from 'vue'
import { usePersonStore } from '../stores/person'
import { useSettingStore } from '../stores/setting'
import { useGroupStore } from '../stores/group'
import { useScoreStore } from '../stores/score'
import { storeToRefs } from 'pinia'
import { remToPx } from '../assets/script/util'
import { getAvatar } from '../utils/AvatarUtil'
import { GroupFilled as GroupIcon, PersonFilled as PersonIcon } from '@vicons/material'
import { useMessage } from 'naive-ui'

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const scoreStore = useScoreStore()
const { rates } = storeToRefs(scoreStore)

const showModal = ref(false)
const currentPerson = ref(null)

const showPerson = ref(true)

const message = useMessage()

const clickHandler = (person) => {
  showModal.value = true
  currentPerson.value = person
}

const scoreHandler = (rate) => {
  if (currentPerson.value?.score)
    currentPerson.value.score += rate.score
  else
    currentPerson.value.score = rate.score
  showModal.value = false
  message.success('操作成功')
}
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 70%"
      :title="'向 '+  currentPerson.name +' 发送点评'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showModal=false"
    >
      <div
        style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:1rem auto auto;
            "
      >
        <div
          v-for="item in rates"
          style="
                width: 6rem;
                height: 6rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
          @click="scoreHandler(item)"
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
            <div class="flex flex-col items-center">
              <p style="text-align: center;">{{ item?.name }}</p>
              <n-tag size="small" :type="item.score>=0 ? 'info':'error'">{{ item?.score ?? 0 }}</n-tag>
              <n-p depth="3" style="font-size: 0.75rem;margin: 0;">{{ item?.description }}</n-p>
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </n-modal>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 4rem)">
      <n-scrollbar v-if="showPerson">
        <div
          style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:1rem auto auto;
            "
        >
          <div
            v-for="item in personList"
            style="
                width: 6rem;
                height: 6rem;
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
                :size="remToPx(3)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
                style="margin: 0.5rem auto"
              />
              <div class="flex flex-row items-center">
                <p>{{ item?.name }}</p>
                <n-tag size="small" :type="item?.score>=0 ? 'info':'error'">{{ item?.score ?? 0 }}</n-tag>
              </div>
            </div>
          </div>
        </div>
      </n-scrollbar>
      <n-scrollbar v-else>
        <div
          style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:1rem auto auto;
            "
        >
          <div
            v-for="item in groups"
            style="
                width: 12rem;
                height: 6rem;
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
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                "
            >
              <n-avatar
                v-if="enableAvatar"
                :size="remToPx(3)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
                style="margin: 0.5rem auto"
              />
              <span>{{ item?.name }}</span>
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
        <n-space justify="space-between" style="width: 100%">
          <div class="flex">
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="showPerson=false"
            >
              <n-icon size="1.5rem">
                <group-icon />
              </n-icon>
              分组
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="showPerson=true"
            >
              <n-icon size="1.5rem">
                <PersonIcon />
              </n-icon>
              个人
            </div>
          </div>
        </n-space>
      </div>
    </n-layout-footer>
  </n-layout>
</template>

<style scoped>

</style>