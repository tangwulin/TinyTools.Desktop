<script setup>
import { ref, watch } from 'vue'
import { usePersonStore } from '../stores/person'
import { useSettingStore } from '../stores/setting'
import { useGroupStore } from '../stores/group'
import { useScoreStore } from '../stores/score'
import { storeToRefs } from 'pinia'
import { remToPx } from '../assets/script/util'
import { getAvatar } from '../utils/AvatarUtil'
import { GroupFilled as GroupIcon, PersonFilled as PersonIcon } from '@vicons/material'
import { useMessage } from 'naive-ui'
import { History as HistoryIcon } from '@vicons/tabler'
import { ArrowUndo24Filled as UndoIcon } from '@vicons/fluent'
import {  useRoute } from 'vue-router'
import { useGeneralStore } from '../stores/general'

const route = useRoute()

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const scoreStore = useScoreStore()
const { rates, scoreHistories } = storeToRefs(scoreStore)

const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

const showModal = ref(false)
const current = ref(null)

const showPerson = ref(false)
showPerson.value = route.query.type === 'person'

const message = useMessage()

const clickHandler = (item) => {
  showModal.value = true
  current.value = item
}

const scoreHandler = (rate) => {
  if (current.value?.score)
    current.value.score += rate.score
  else
    current.value.score = rate.score
  scoreHistories.value.push(
    {
      time: Date.now(),
      owner: current.value.uniqueId,
      ownerType: ('members' in current.value) ? 'group' : 'person',
      score: rate.score,
      forWhat: rate.name,
    })
  showModal.value = false
  message.success('操作成功')
}

const createAvatars = (item) => {
  const persons = personList.value.filter(p => item.members.includes(p.uniqueId))
  return persons.map(p => ({ name: p.name, src: getAvatar(p) }))
}

const createDropdownOptions = (options) => options.map((option) => ({
  key: option.name,
  label: option.name,
}))
watch(() => route.query, () => {
  showPerson.value = route.query.type === 'person'
  if (route.query?.type) lastScoreType.value = route.query.type
})

</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 70%"
      :title="'向 '+  current.name +' 发送点评'"
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
                  margin:0 0.5rem;
                "
            >
              <n-avatar
                v-if="enableAvatar"
                :size="remToPx(3)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
              />
              <div class="mx-auto flex flex-col" style="font-size: 0.75rem;">
                <span>{{ item?.name }}</span>
                <n-space justify="space-between"><span>{{ item?.members.length }}人</span>
                  <n-tag :bordered="false" size="small">{{ item.score ?? 0 }}</n-tag>
                </n-space>
                <n-avatar-group :options="createAvatars(item)" :size="remToPx(2)" :max="5">
                  <template #avatar="{ option: { name, src } }">
                    <n-tooltip>
                      <template #trigger>
                        <n-avatar :src="src" />
                      </template>
                      {{ name }}
                    </n-tooltip>
                  </template>
                  <template #rest="{ options: restOptions, rest }">
                    <n-dropdown :options="createDropdownOptions(restOptions)" placement="top"
                                arrow-style="overflow: hidden;" style="overflow: hidden;">
                      <n-avatar style="font-size: 0.75rem;">+{{ rest }}</n-avatar>
                    </n-dropdown>
                  </template>
                </n-avatar-group>
              </div>
            </div>
          </div>

          <div
            style="
                width: 12rem;
                height: 6rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
            @click="$router.push({name:'groupManage',query:{showAddModal:'true'}})"
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
              <n-icon size="3rem">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path
                    d="M368.5 240H272v-96.5c0-8.8-7.2-16-16-16s-16 7.2-16 16V240h-96.5c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7H240v96.5c0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7 8.8 0 16-7.2 16-16V272h96.5c8.8 0 16-7.2 16-16s-7.2-16-16-16z"
                  />
                </svg>
              </n-icon>
              <span>添加分组</span>
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
              @click="$router.push({name:'score',query:{type:'group'}})"
            >
              <n-icon size="1.5rem">
                <group-icon />
              </n-icon>
              分组
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="$router.push({name:'score',query:{type:'person'}})"
            >
              <n-icon size="1.5rem">
                <PersonIcon />
              </n-icon>
              个人
            </div>
          </div>
          <div class="flex">
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="showPerson=true"
            >
              <n-icon size="1.5rem">
                <undo-icon />
              </n-icon>
              撤销
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="$router.push({name:'scoreHistory'})"
            >
              <n-icon size="1.5rem">
                <history-icon />
              </n-icon>
              历史
            </div>
          </div>
        </n-space>
      </div>
    </n-layout-footer>
  </n-layout>
</template>

<style scoped>

</style>