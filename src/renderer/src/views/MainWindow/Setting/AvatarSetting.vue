<script lang="ts" setup>
import { asyncComputed } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import EntityItem from '../../../components/EntityItem.vue'
import { getAvatarUrls } from '../../../services/AvatarService'
import { useSettingStore } from '../../../stores/setting'

const message = useMessage()

const setting = useSettingStore()
const { enableAvatar, enableFallbackAvatar, avatarWorks } = storeToRefs(setting)
const works = [
  { value: 1, label: '原神' },
  { value: 2, label: '明日方舟' },
  { value: 3, label: '崩坏·星穹铁道' },
  { value: 4, label: '蔚蓝档案' },
  { value: 5, label: '赛马娘' }
]

const genders = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
  // { label: '未填写', value: 9 },
] //此处参考了GB/T 2261.1-2003

const selectedSex = ref(1)
const value = ref('')
const selectedAvatar = asyncComputed(() => getAvatarUrls(selectedSex.value, avatarWorks.value), [])

const writeClipboard = (x) => {
  navigator.clipboard
    .writeText(x)
    .then(() => {
      message.success('链接已复制到剪贴板')
    })
    .catch(() => {
      message.error('请授予剪贴板权限！')
    })
}
watch(value, async () => {
  selectedAvatar.value = await getAvatarUrls(selectedSex.value, avatarWorks.value).then((res) =>
    res.filter((item) => item.description.includes(value.value))
  )
})
</script>

<template>
  <n-space vertical>
    <n-space>
      <p>启用头像</p>
      <n-switch v-model:value="enableAvatar" />
    </n-space>
    <n-space>
      <p>在未设置头像时fallback到内置头像</p>
      <n-switch v-model:value="enableFallbackAvatar" />
    </n-space>
    <n-space>
      <p>内置头像来源</p>
      <n-checkbox-group v-model:value="avatarWorks" :disabled="!enableFallbackAvatar" :min="1">
        <n-space item-style="display: flex;">
          <n-checkbox
            v-for="item in works"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </n-space>
      </n-checkbox-group>
    </n-space>
    <n-space>
      <n-collapse>
        <n-input v-model:value="value" placeholder="搜索" type="text" />
        <n-collapse-item :title="`头像列表 共${selectedAvatar.length}个 点击头像可复制链接`">
          <n-radio-group v-model:value="selectedSex">
            <n-space>
              <n-radio v-for="gender in genders" :key="gender.value" :value="gender.value">
                {{ gender.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: auto">
            <entity-item
              v-for="(item, index) in selectedAvatar"
              :key="index"
              :avatar="item.url"
              :display-name="item.description"
              @click="writeClipboard(item.url)"
            />
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-space>
  </n-space>
</template>

<style scoped></style>
