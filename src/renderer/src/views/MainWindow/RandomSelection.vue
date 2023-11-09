<script lang="ts" setup>
import { Dice, DiceOutline } from '@vicons/ionicons5'
import { computed, nextTick, ref, watch } from 'vue'
import { useSettingStore } from '../../stores/setting'
import { storeToRefs } from 'pinia'
import { NButton, useMessage } from 'naive-ui'
import raffleBgm from '../../assets/audio/raffle-2.mp3'
import { getAvatar } from '../../utils/avatarUtil'
import remToPx from '../../utils/remToPx'
import { Person } from '../../types/person'
import { AppDatabase } from '../../db'
import { selectSomething } from '../../utils/arrayUtil'
import singleVideo from '../../assets/video/单抽出金.mp4'
import groupVideo from '../../assets/video/十连出金.mp4'

const db = AppDatabase.getInstance()
const message = useMessage()

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const showFastModal = ref(false)
const showAdvancedModal = ref(false)
const number = ref(1)
const number2 = ref(1)
const isSelected = ref(false)
const selectedPerson = ref<Person[]>([])
const selectedSex = ref([1, 2, 9])
const selectionList = ref<Person[]>([])

const hasHover1 = ref(false)
const hasHover2 = ref(false)

const playingVideo = ref(false)
const videoSrc = computed(() => {
  if (number.value === 1) return singleVideo
  else return groupVideo
})

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 }
] //此处参考了GB/T 2261.1-2003

const persons = ref<Person[]>([])
const options1 = ref<
  {
    label: string
    value: number
    disabled: boolean
  }[]
>([])
const value1 = ref<number[]>([])

const handler = (fast: boolean) => {
  const list = fast ? persons.value : selectionList.value
  showFastModal.value = false
  showAdvancedModal.value = false
  isSelected.value = true

  if (fast) {
    const player = document.querySelector('audio')
    if (player) player.play()
    const interval = setInterval(() => {
      selectedPerson.value = selectSomething(list, number.value).slice()
      //不使用lodash的shuffle，因为lodash的shuffle不一定机会均等
    }, 250)
    setTimeout(() => {
      clearInterval(interval)
    }, 3000)
  } else {
    playingVideo.value = true
    nextTick(() => {
      const videoElement = document.querySelector('video')
      if (videoElement) {
        videoElement.addEventListener('ended', () => {
          playingVideo.value = false
          message.success('抽选完成')
        })
      }
    })
    setTimeout(() => {
      selectedPerson.value = selectSomething(list, number2.value).slice() //抽一次就行了
    }, 3000)
  }
}

function createOptions(x: Person[]) {
  return x.map((item) => ({
    label: item.name,
    value: item.id as number,
    disabled: false
  }))
}

function createValues(x: Person[]) {
  return x.map((item) => item.id as number)
}

db.persons
  .toArray()
  .then((result) => {
    persons.value = result
  })
  .then(() => {
    options1.value = createOptions(persons.value)
    value1.value = createValues(persons.value)
  })

watch(selectedSex, () => {
  options1.value = createOptions(
    persons.value.filter((item) => selectedSex.value.includes(item.genderCode))
  )
})

watch(
  options1,
  (value, oldValue) => {
    if (value.length < oldValue?.length) {
      value1.value = createValues(
        persons.value.filter((item) => selectedSex.value.includes(item.genderCode))
      )
    }
  },
  { deep: true }
)

watch(
  value1,
  () => {
    selectionList.value = persons.value.filter((item: Person) =>
      value1.value.includes(item.id as number)
    )
    if (number.value > selectionList.value.length) number.value = selectionList.value.length
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
              :key="item.id"
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
          <span>快速抽选</span>
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
          <span>常规抽选</span>
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
        v-model:value="number2"
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
                <n-checkbox
                  v-for="sex in sexes"
                  :key="sex.value"
                  :label="sex.label"
                  :value="sex.value"
                />
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
          <n-button
            type="primary"
            :disabled="number === 0 || number > selectionList.length"
            @click="handler(false)"
            >开始
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <!--  视频Modal  <-->
  <n-modal v-model:show="playingVideo" transform-origin="center">
    <video :src="videoSrc" preload="auto" autoplay style="width: 100%; height: 100%" />
  </n-modal>
</template>

<style scoped></style>
