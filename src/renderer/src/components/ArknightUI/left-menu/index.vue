<script lang="ts" setup>
import { asyncComputed } from '@vueuse/core'
import { useDialog, useNotification } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { h, ref } from 'vue'
import IconArchive from '../../../components/ArknightUI/icons/Archive.vue'
import IconFriend from '../../../components/ArknightUI/icons/Friend.vue'
import { getCharacterKey, getCharacterSupportLanguages } from '../../../services/ArknightsUIService'
import { getAvatarUrls } from '../../../services/AvatarService'
import { useArknightsUIStore } from '../../../stores/arknightsUI'
import EntityItem from '../../EntityItem.vue'
import ANMessage from '../ANMessage.vue'
import NewsBanner from './news-banner.vue'
import VoiceBox from './voice-box.vue'

defineProps<{
  voice: string
}>()
defineEmits<{
  (e: 'clear-voice'): void
}>()

const notification = useNotification()
const dialog = useDialog()

const arknightsUIStore = useArknightsUIStore()
const {
  selectedCharacterKey,
  selectedCharacterVoiceLang,
  selectedCharacterDialogLang,
  selectedCharacterImageIndex
} = storeToRefs(arknightsUIStore)

const showArchive = ref(false)

const handleClick1 = () => {
  notification.create({
    closable: false,
    duration: 3000,
    content: () => h(ANMessage, null, () => '开发中，敬请期待')
  })
}

const genders = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
  // { label: '未填写', value: 9 },
] //此处参考了GB/T 2261.1-2003

const keyword = ref('')
const selectedSex = ref(1)
const selectedAvatar = asyncComputed(
  () =>
    getAvatarUrls(selectedSex.value, [2]).then((res) =>
      res.filter((item) => item.description.includes(keyword.value))
    ),
  []
)

const clickHandler = (name: string) => {
  dialog.warning({
    title: '更换干员',
    content: `确定更换干员为${name}吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      const key = getCharacterKey(name)
      if (!key) {
        notification.error({
          title: '更换失败',
          duration: 3000,
          content: `未找到干员${name}`
        })
        return
      }
      getCharacterSupportLanguages(key).then((res) => {
        const unSupportVoiceLang = !res.voice.includes(selectedCharacterVoiceLang.value)
        const unSupportDialogLang = !res.dialog.includes(selectedCharacterDialogLang.value)
        const content = [] as any[]
        if (unSupportVoiceLang || unSupportDialogLang) {
          if (unSupportVoiceLang) {
            content.push(
              h('span', null, `选择的干员不支持 ${selectedCharacterVoiceLang.value} 语音`)
            )
          }
          if (unSupportDialogLang) {
            content.push(
              h(
                'span',
                null,
                `${unSupportVoiceLang ? '、' : '选择的干员不支持 '}${
                  selectedCharacterDialogLang.value
                } 对话`
              )
            )
          } else {
            content.push(h('br'))
          }

          let msg = '继续更换将切换至支持的 '
          if (unSupportVoiceLang) {
            msg += res.voice[0] + ' 语音'
          }
          if (unSupportDialogLang) {
            if (unSupportVoiceLang) {
              msg += '和 '
            }
            msg += res.dialog[0] + ' 对话'
          }
          content.push(h('p', null, msg + '，是否继续更换？'))
          dialog.warning({
            title: '警告',
            content: () => h('div', null, content),
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              selectedCharacterKey.value = key
              if (unSupportVoiceLang) {
                selectedCharacterVoiceLang.value = res.voice[0]
              }
              if (unSupportDialogLang) {
                selectedCharacterDialogLang.value = res.dialog[0]
              }
              selectedCharacterImageIndex.value = 0
              notification.success({
                title: '更换成功',
                duration: 3000,
                content: `已更换为${name}`
              })
            },
            onNegativeClick: () => {
              return
            }
          })
        } else {
          selectedCharacterKey.value = key
          selectedCharacterImageIndex.value = 0
          notification.success({
            title: '更换成功',
            duration: 3000,
            content: `已更换为${name}`
          })
        }
      })
    }
  })
}
</script>

<template>
  <div class="left-menu">
    <VoiceBox v-show="voice" :text="voice" @click="$emit('clear-voice')" />
    <div class="flex">
      <NewsBanner />
      <div>
        <div class="button friend-button" @click="handleClick1">
          <IconFriend class="icon" />
          <span class="text">好友</span>
        </div>
        <div class="button archive-button" @click="showArchive = true">
          <IconArchive class="icon" />
          <span class="text">档案</span>
        </div>
      </div>
    </div>
  </div>

  <n-modal v-model:show="showArchive" :mask-closable="false">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 50%"
      title="更换干员"
      @close="showArchive = false"
    >
      <n-input v-model:value="keyword" clearable placeholder="搜索" type="text" />
      <n-space>
        <span>筛选</span>
        <n-radio-group v-model:value="selectedSex">
          <n-space>
            <n-radio v-for="gender in genders" :key="gender.value" :value="gender.value">
              {{ gender.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
        <span>点击下方卡片即可更改干员</span>
      </n-space>
      <n-scrollbar style="max-height: 50vh; overflow-x: hidden">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: auto">
          <entity-item
            v-for="(item, index) in selectedAvatar"
            :key="index"
            :avatar="item.url"
            :display-name="item.description"
            @click="clickHandler(item.description)"
          />
        </div>
      </n-scrollbar>
    </n-card>
  </n-modal>
</template>

<style lang="scss" scoped>
.left-menu {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  transform-origin: left center;
  transform: perspective(600px) rotateY(10deg);
}

.news-banner {
  margin-right: 10px;
  pointer-events: auto;
}

.button {
  width: 150px;
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: auto;
  cursor: pointer;
  transition: background-color 0.2s;

  .text {
    font-family: 'FZSong';
    font-size: 32px;
  }

  .icon {
    font-size: 46px;
  }
}

.friend-button {
  color: white;
  background-color: rgba(50, 50, 50, 0.9);
  box-shadow: 0 0 10px 0 #222222;
  margin-bottom: 4px;

  &:hover {
    background-color: rgb(50, 50, 50);
  }
}

.archive-button {
  color: #323232;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 10px 0 #aaaaaa;

  &:hover {
    background-color: white;
  }

  .icon {
    color: rgba(0, 0, 0, 0.38);
  }
}
</style>
