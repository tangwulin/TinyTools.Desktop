<script setup>
import { useSettingStore } from "../../stores/setting";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();

const settingStore = useSettingStore();
const { isFirstSetup } = storeToRefs(settingStore);

const endSetup = () => {
  isFirstSetup.value = false;
  router.push({ name: "mainWindow" });
};
</script>

<template>
  <div style="height: 100vh;display: flex;justify-content: center">
    <div style="margin: auto 0">
      <n-result status="success" title="配置完成">
        <template #footer>
          <n-space justify="center">
            <n-button @click="router.push({name:'setup schedule'})">返回修改</n-button>
            <n-button type="success" @click="endSetup">开始使用</n-button>
          </n-space>
        </template>
      </n-result>
    </div>
  </div>
</template>

<style scoped>

</style>