<script lang="ts" setup>
import { asyncComputed, useElementSize } from '@vueuse/core'
import { Howl, Howler } from 'howler'
import { random } from 'lodash-es'
import Parallax from 'parallax-js'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import bgMusic from '../../assets/audio/sys.mp3'
import Background from '../../components/ArknightUI/Background.vue'
import Character from '../../components/ArknightUI/Character.vue'
import Doctor from '../../components/ArknightUI/Doctor.vue'
import HeaderMenu from '../../components/ArknightUI/HeaderMenu.vue'
import LeftMenu from '../../components/ArknightUI/left-menu/index.vue'
import RightMenu from '../../components/ArknightUI/right-menu/index.vue'
import UserInfo from '../../components/ArknightUI/UserInfo.vue'
import { getCharacterVoice } from '../../services/ArknightsUIService'
import { useArknightsUIStore } from '../../stores/arknightsUI'

const sceneEle = ref<HTMLElement>()
// 视差实例
let parallaxInst: Parallax | undefined = undefined
// 干员音效实例
let charSandInst: Howl | null = null

const arknightsUIStore = useArknightsUIStore()
const { selectedCharacterKey, selectedCharacterVoiceLang, selectedCharacterDialogLang } =
  storeToRefs(arknightsUIStore)

const voiceList = asyncComputed(
  async () =>
    getCharacterVoice(
      selectedCharacterKey.value,
      selectedCharacterVoiceLang.value,
      selectedCharacterDialogLang.value
    ),
  []
)

const currentVoice = ref(-1)

const voiceText = computed(() => {
  if (currentVoice.value > -1) {
    return voiceList.value[currentVoice.value].detail
  }
  return ''
})

// 自动播放背景音乐
const bgMusicInst = new Howl({
  src: bgMusic,
  html5: true,
  volume: 0.7,
  loop: true,
  autoplay: true
})

const isPlaying = ref(false)

bgMusicInst.on('play', () => {
  isPlaying.value = true
})
bgMusicInst.on('pause', () => {
  isPlaying.value = false
})
bgMusicInst.on('stop', () => {
  isPlaying.value = false
})

/**
 * 点击干员
 */
function handleClickCharacter() {
  const len = currentVoice.value > -1 ? voiceList.value.length - 1 : voiceList.value.length
  let index = random(len - 1)
  if (index >= currentVoice.value) {
    index += 1
  }
  if (charSandInst) {
    charSandInst.unload()
  }
  currentVoice.value = index
  charSandInst = new Howl({
    src: [voiceList.value[index].audio],
    html5: true
  })
  charSandInst.play()
}

const dashboardRef = ref<HTMLElement>()
const dashboardWidth = useElementSize(dashboardRef).width
onMounted(() => {
  if (sceneEle.value) {
    parallaxInst = new Parallax(sceneEle.value, {
      pointerEvents: true,
      relativeInput: true,
      scalarX: 20,
      scalarY: 15
    })
  }
})

onBeforeUnmount(() => {
  parallaxInst?.destroy()
  Howler.unload()
})
</script>

<template>
  <div id="dashboard" ref="dashboardRef">
    <div
      style="
        position: fixed;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        z-index: 500;
        color: hsl(92, 0%, 59%);
        margin: 3px;
      "
      @click="bgMusicInst.playing() ? bgMusicInst.stop() : bgMusicInst.play()"
    >
      {{ isPlaying ? '关闭' : '开启' }}BGM
    </div>
    <div ref="sceneEle" :style="{ zoom: `${dashboardWidth / 1500}` }" class="scene">
      <div class="layer" data-depth="0"></div>
      <!-- 背景 -->
      <div class="layer" data-depth="0.1">
        <Background />
      </div>
      <!-- 博士 -->
      <div class="layer" data-depth="0.15">
        <Doctor />
      </div>
      <!-- 干员 -->
      <div class="layer" data-depth="0.2">
        <Character @click="handleClickCharacter" />
      </div>
      <!-- 用户信息 -->
      <div class="layer pointer-events-none" data-depth="0.05">
        <UserInfo />
      </div>
      <!-- 左右菜单 -->
      <div class="layer pointer-events-none" data-depth="0.4">
        <LeftMenu
          :voice="voiceText"
          @clear-voice="
            () => {
              currentVoice = -1
            }
          "
        />
        <RightMenu />
      </div>
    </div>
    <div :style="{ zoom: `${dashboardWidth / 1500}` }" class="absolute left-0 top-0">
      <HeaderMenu />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#dashboard {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #eeeedf;
}

.scene {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #eeeedf;
}

.layer {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
