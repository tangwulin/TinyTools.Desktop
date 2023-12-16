<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingStore } from '../../stores/setting'

const settingStore = useSettingStore()
const { isFirstSetup } = storeToRefs(settingStore)

const router = useRouter()

const approved = ref(false)

const navToSetup = () => {
  if (isFirstSetup.value) {
    router.push({ name: 'setup' })
  } else {
    router.push({ name: 'mainWindow' })
  }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center" style="height: 100vh">
    <n-space align="center" size="large" vertical>
      <p style="font-size: 4rem">Hi There！</p>
      <!--直男审美，我尽力了-->
      <p>欢迎使用TinyTools!</p>
      <n-button :disabled="!approved" type="primary" @click="navToSetup">下一步</n-button>
      <n-space>
        <n-checkbox v-model:checked="approved" />
        <p>
          我已阅读并同意
          <!--suppress CssUnresolvedCustomProperty -->
          <n-button style="color: var(--n-text-color-hover)" text>《用户协议》</n-button>
          <!--          TODO:增加对应内容-->
          和
          <!--suppress CssUnresolvedCustomProperty -->
          <n-button style="color: var(--n-text-color-hover)" text>《隐私政策》</n-button>
        </p>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped></style>
