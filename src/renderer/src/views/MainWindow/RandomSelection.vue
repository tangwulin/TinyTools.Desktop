<script lang="ts" setup>
import { Dice, DiceOutline } from '@vicons/ionicons5'
import { ref, type Ref, watch } from 'vue'
import { useSettingStore } from '../../stores/setting'
import { storeToRefs } from 'pinia'
import { NButton } from 'naive-ui'
import raffleBgm from '../../assets/audio/raffle-2.mp3'
import { getAvatar } from '../../utils/avatarUtil'
import remToPx from '../../utils/remToPx'
import { Person } from '../../types/person'
import { AppDatabase } from '../../db'
import { useObservable } from '@vueuse/rxjs/index'
import { liveQuery } from 'dexie'
import { asyncComputed } from '@vueuse/core'
import { from } from '@vueuse/rxjs'

const db = AppDatabase.getInstance()
const persons = useObservable(from(liveQuery(() => db.persons.toArray()))) as Readonly<
  Ref<Person[]>
>

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const showFastModal = ref(false)
const showAdvancedModal = ref(false)
const number = ref(1)
const isSelected = ref(false)
const selectedPerson = ref<Person[]>([])
const selectedSex = ref([1, 2, 9])
const selectionList = ref<Person[]>([])

const hasHover1 = ref(false)
const hasHover2 = ref(false)

// const itemsEachRow = ref(4);

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 }
] //此处参考了GB/T 2261.1-2003

const selectSomething = (list: any[], x: number) => {
  const len = list.length
  const result: Person[] = []
  const set = new Set()
  while (set.size < x) {
    const index = Math.floor(Math.random() * len)
    if (!set.has(index)) {
      set.add(index)
      result.push(list[index])
    }
  }
  return result
}

const handler = (fast: boolean) => {
  const list = fast ? persons.value : selectionList.value
  showFastModal.value = false
  showAdvancedModal.value = false
  isSelected.value = true
  const player = document.querySelector('audio')
  if (player) player.play()
  const interval = setInterval(() => {
    selectedPerson.value = selectSomething(list, number.value).slice()
    //不使用lodash的shuffle，因为lodash的shuffle会改变原数组，而此处不希望改变原数组
  }, 250)
  setTimeout(() => {
    clearInterval(interval)
  }, 3000)
}

function createOptions(x: any) {
  return x.map((item: any) => ({
    label: item.name,
    value: item.id,
    disabled: false
  }))
}

function createValues(x: any) {
  return x.map((item: any) => item.id)
}

const value1 = ref<number[]>([])

const options1 = asyncComputed(() =>
  createOptions(persons.value.filter((item) => selectedSex.value.includes(item.genderCode)))
)

watch(options1, (value, oldValue) => {
  if (value.length < oldValue?.length) {
    value1.value = createValues(
      persons.value.filter((item) => selectedSex.value.includes(item.genderCode))
    )
  } else {
    if (!oldValue) {
      value1.value = value1.value.filter((item) => value.map((item) => item.value).includes(item))
    }
  }
})

watch(
  value1,
  () => {
    selectionList.value = persons.value.filter((item: Person) =>
      value1.value.includes(item.id as number)
    )
  },
  { deep: true }
)
</script>

<template>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 6rem)">
      <div class="flex flex-col justify-center items-center h-full">
        <audio :src="raffleBgm" />
        <n-layout
          v-if="isSelected"
          :native-scrollbar="false"
          content-style="display:flex;height:100%;width:100%;"
        >
          <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: auto">
            <div
              v-for="item in selectedPerson"
              style="
                width: 8rem;
                height: 8rem;
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
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                "
              >
                <n-avatar
                  v-if="enableAvatar"
                  :img-props="{ referrerpolicy: 'no-referrer' }"
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
        </n-layout>
        <n-p v-else depth="3" style="font-size: 2rem"> 还没有抽选……</n-p>
      </div>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div class="flex flex-row justify-around items-center" style="height: 6rem">
        <div
          class="flex flex-col justify-center items-center"
          style="margin: auto; width: 4rem; cursor: pointer"
          @click="showFastModal = true"
          @mouseenter="hasHover1 = true"
          @mouseleave="hasHover1 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover1" />
            <DiceOutline v-else />
          </n-icon>
          <span>快速开始</span>
        </div>
        <div
          class="flex flex-col justify-center items-center"
          style="margin: auto; width: 4rem; cursor: pointer"
          @click="showAdvancedModal = true"
          @mouseenter="hasHover2 = true"
          @mouseleave="hasHover2 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover2" />
            <DiceOutline v-else />
          </n-icon>
          <span>自定义</span>
        </div>
      </div>
    </n-layout-footer>
  </n-layout>

  <n-modal v-model:show="showFastModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 50%"
      title="快速抽选"
      @close="showFastModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :max="persons.length"
        :min="1"
        button-placement="both"
      />
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(true)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showAdvancedModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 50%; overflow-y: auto; overflow-x: hidden"
      title="自定义抽选"
      @close="showAdvancedModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :max="selectionList.length"
        :min="1"
        button-placement="both"
      />
      <n-divider style="margin: 1rem 0" />
      <n-scrollbar style="max-height: 50vh; overflow-x: hidden">
        <n-collapse>
          <n-collapse-item name="1" title="性别范围">
            <n-checkbox-group v-model:value="selectedSex">
              <n-space item-style="display: flex;">
                <n-checkbox v-for="sex in sexes" :label="sex.label" :value="sex.value" />
              </n-space>
            </n-checkbox-group>
          </n-collapse-item>
          <n-collapse-item name="2" title="人员范围">
            <n-transfer
              ref="transfer"
              v-model:value="value1"
              :options="options1"
              class="pr-3"
              source-filterable
            />
          </n-collapse-item>
        </n-collapse>
      </n-scrollbar>
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(false)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped></style>
