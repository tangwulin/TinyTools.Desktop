<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSettingStore } from "../stores/setting";
import { storeToRefs } from "pinia";

const settingStore = useSettingStore();
const { isFirstSetup } = storeToRefs(settingStore);

const router = useRouter();

const approved = ref(false);

const navToSetup = () => {
  if (isFirstSetup.value)
  {
    router.push({ name: "setup" });
  }
  else
  {
    router.push({ name: "mainWindow" });
  }
};
</script>

<template>
  <div class="flex flex-col justify-center items-center" style="height: 100vh">
    <n-space vertical size="large" align="center">
      <p style="font-size: 2rem;">Hi There！</p>
      <p>欢迎使用TinyTools!<br /> 点击下方按钮即可获得专属工具</p>
      <n-button type="primary" :disabled="!approved" @click="navToSetup">下一步
      </n-button>
      <n-space>
        <n-checkbox v-model:checked="approved" />
        <p>我已阅读并同意
          <!--suppress CssUnresolvedCustomProperty -->
          <n-button text style="color: var(--n-text-color-hover)">《用户协议》</n-button>
          和
          <!--suppress CssUnresolvedCustomProperty -->
          <n-button text style="color: var(--n-text-color-hover)">《隐私政策》</n-button>
        </p>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>

</style>