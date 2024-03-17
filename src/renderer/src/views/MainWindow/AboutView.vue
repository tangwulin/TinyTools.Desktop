<script lang="ts" setup>
import type { ElectronAPI } from '@electron-toolkit/preload'
import { useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import logo from '../../assets/images/logo.png'
import { useSettingStore } from '../../stores/setting'

const setting = useSettingStore()
const { enableDevelopFeature } = storeToRefs(setting)

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}
/* eslint-disable */
// noinspection TypeScriptUnresolvedReference
// @ts-ignore:2304
const version = __APP_VERSION__
// noinspection TypeScriptUnresolvedReference
// @ts-ignore:2304
const github_sha = __GITHUB_SHA__
// noinspection TypeScriptUnresolvedReference
// @ts-ignore:2304
const revision = __REVISION__ // @ts-ignore
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const date = now.getDate()
const buildDate = `${year}/${month + 1}/${date}`
const githubLink = `https://github.com/tangwulin/TinyTools.Desktop/tree/${github_sha}`
/* eslint-enable */

const message = useMessage()

let clickTimes = 0
const clickHandler = () => {
  if (!enableDevelopFeature.value) clickTimes++
  if (clickTimes >= 5) {
    enableDevelopFeature.value = true
  }
  if (enableDevelopFeature.value)
    if (clickTimes >= 5) message.success('测试功能已开启！请重新启动程序')
    else message.info('测试功能已开启！')
}

const checkUpdate = () => {
  if (isElectron) {
    electron.ipcRenderer.send('checkForUpdates')
  }
}
</script>
<template>
  <n-scrollbar>
    <div class="flex flex-col items-center h-full pb-2" style="height: 100%">
      <div class="w-3/5 p-4">
        <img :src="logo" alt="logo" style="margin: auto" />
      </div>
      <p class="mb-8" @click="clickHandler">TinyTools v{{ version }} Build {{ revision }}</p>
      <p>TinyTools使用Electron+Vite+Vue构建</p>
      <div class="flex flex-row">
        <a href="https://www.electronjs.org/zh" target="_blank">
          <img alt="vite logo" class="h-16" src="https://www.electronjs.org/assets/img/logo.svg" />
        </a>
        <p class="text-5xl flex items-center text-gray-500">+</p>
        <a href="https://vitejs.cn/" target="_blank">
          <img alt="vite logo" class="h-16" src="https://vitejs.cn/vite3-cn/logo.svg" />
        </a>
        <p class="text-5xl flex items-center text-gray-500">+</p>
        <a href="https://cn.vuejs.org/" target="_blank">
          <svg class="h-16" viewBox="0 0 128 128">
            <path
              d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"
              fill="#42b883"
            ></path>
            <path d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" fill="#35495e"></path>
          </svg>
        </a>
      </div>
      <p>用户群：921555937</p>
      <p>内置头像来源：</p>
      <div>
        <p>
          原神：<a href="https://www.bilibili.com/read/cv19356383/" target="_blank">图片来源</a
          >&nbsp; &nbsp;
          <a
            href="https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2%E7%AD%9B%E9%80%89"
            target="_blank"
            >性别判断来源</a
          >
        </p>
        <p>
          明日方舟：<a
            href="https://prts.wiki/w/%E5%B9%B2%E5%91%98%E4%B8%80%E8%A7%88"
            target="_blank"
            >图片&性别来源</a
          >
        </p>
        <p>蔚蓝档案：<a href="https://kivo.wiki/">图片来源</a></p>
        <p>
          星穹铁道：<a
            href="https://starrail.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5#%E8%A7%92%E8%89%B2"
            target="_blank"
            >图片来源</a
          >
        </p>
        <p>
          赛马娘：<a
            href="https://wiki.biligame.com/umamusume/%E8%B5%9B%E9%A9%AC%E5%A8%98%E4%B8%80%E8%A7%88"
            target="_blank"
            >图片来源</a
          >
        </p>
        <p>本项目所使用角色头像版权均属于各游戏版权方</p>
      </div>
      <div class="flex flex-col mt-4">
        <p>开源项目鸣谢</p>
        <a href="https://github.com/tusen-ai/naive-ui" target="_blank">Naive-UI</a>
        <a href="https://github.com/alex8088/electron-vite" target="_blank">electron-vite</a>
        <a href="https://github.com/qq15725/modern-screenshot" target="_blank">
          modern-screenshot</a
        >
        <a href="https://github.com/lxchapu/arknights" target="_blank">仿明日方舟UI</a>
      </div>
      <!--      <p>项目地址：</p>-->
      <div class="flex flex-row mt-4">
        <a href="https://github.com/tangwulin/TinyTools.Desktop" target="_blank">
          <svg class="h-12" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 0 0 3.8.4c8.3 0 11.5-6.1 11.5-11.4c0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 0 1-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5c-10.2-26.5-24.9-33.6-24.9-33.6c-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8c11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0 0 25.6-6c2-14.8 7.8-24.9 14.2-30.7c-49.7-5.8-102-25.5-102-113.5c0-25.1 8.7-45.6 23-61.6c-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 0 1 5-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 0 1 112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 0 1 5 .5c12.2 31.6 4.5 55 2.2 60.8c14.3 16.1 23 36.6 23 61.6c0 88.2-52.4 107.6-102.3 113.3c8 7.1 15.2 21.1 15.2 42.5c0 30.7-.3 55.5-.3 63c0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 0 0 4-.4C415.9 449.2 480 363.1 480 261.7C480 134.9 379.7 32 256 32z"
              fill="currentColor"
            ></path>
          </svg>
        </a>
        <!--        <a href="https://github.com/tangwulin/TinyTools/" target="_blank">-->
        <!--          <img-->
        <!--            class="h-12"-->
        <!--            src="https://gitee.com/static/images/logo-black.svg?t=158106664"-->
        <!--            alt="gitee logo"-->
        <!--          />-->
        <!--        </a>-->
      </div>
      <n-button class="mt-4" type="primary" @click="checkUpdate">检查更新</n-button>
      <div class="mt-4 text-xs">
        <p class="mt-auto flex">
          Powered By Aurora Studio
          <a :href="githubLink" class="ml-auto" target="_blank"> #{{ revision }} </a>
          &nbsp;{{ buildDate }}
        </p>
        <p>Copyright ©2022-{{ new Date().getFullYear() }} Aurora Studio, All Rights Reserved.</p>
      </div>
    </div>
  </n-scrollbar>
</template>

<style scoped></style>
