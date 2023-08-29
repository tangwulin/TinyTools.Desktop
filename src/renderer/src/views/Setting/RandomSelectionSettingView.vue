<script setup>
import { useSettingStore } from "../../stores/setting";
import { storeToRefs } from "pinia";

const setting = useSettingStore();
const { enableAvatar,enableFallbackAvatar, avatarWorks } = storeToRefs(setting);
const works = [{ value: 1, label: "原神" }, { value: 2, label: "明日方舟" }];
</script>

<template>
  <n-space vertical>
    <n-space>
      <p>启用头像</p>
      <n-switch v-model:value="enableAvatar"/>
    </n-space>
    <n-space>
      <p>在未设置头像时fallback到内置头像</p>
      <n-switch v-model:value="enableFallbackAvatar"/>
    </n-space>
    <n-space >
      <p>内置头像来源</p>
      <n-checkbox-group v-model:value="avatarWorks" :disabled="!enableFallbackAvatar">
        <n-space item-style="display: flex;">
          <n-checkbox v-for="item in works" :value="item.value" :label="item.label" />
        </n-space>
      </n-checkbox-group>
    </n-space>
  </n-space>
</template>

<style scoped>

</style>