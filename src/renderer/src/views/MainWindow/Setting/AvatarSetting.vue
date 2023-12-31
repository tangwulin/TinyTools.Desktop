<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useSettingStore } from '../../../stores/setting'
import { getAvatarUrls } from '../../../utils/avatarUtil'
import remToPx from '../../../utils/remToPx'

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

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
  // { label: '未填写', value: 9 },
] //此处参考了GB/T 2261.1-2003

const selectedSex = ref(1)
const selectedAvatar = ref(getAvatarUrls(1, avatarWorks.value))
const changeHandler = () => {
  selectedAvatar.value = getAvatarUrls(selectedSex.value, avatarWorks.value).filter((item) =>
    item.description.includes(value.value)
  )
}

const value = ref('')
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

watch(avatarWorks, changeHandler)
watch(value, changeHandler)
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
        <n-input v-model:value="value" type="text" placeholder="搜索" />
        <n-collapse-item :title="`头像列表 共${selectedAvatar.length}个 点击头像可复制链接`">
          <n-radio-group v-model:value="selectedSex" @change="changeHandler">
            <n-space>
              <n-radio v-for="sex in sexes" :key="sex.value" :value="sex.value">
                {{ sex.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: auto">
            <div
              v-for="(item, index) in selectedAvatar"
              :key="index"
              style="
                width: 8rem;
                height: 8rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
              @click="writeClipboard(item.url)"
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
                  :img-props="{ referrerpolicy: 'no-referrer' }"
                  :size="remToPx(4)"
                  :src="item.url"
                  lazy
                  object-fit="contain"
                  round
                  style="margin-bottom: 0.5rem"
                />
                <span>{{ item?.description }}</span>
              </div>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-space>
  </n-space>
</template>

<style scoped></style>
