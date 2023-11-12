<script setup lang="ts">
import { h, ref } from 'vue'
import { type ElectronAPI } from '@electron-toolkit/preload'
import { NAvatar, type SelectRenderLabel } from 'naive-ui'
import { useSettingStore } from '../../../stores/setting'
import { storeToRefs } from 'pinia'
import { type School } from '../../../interface/school'

const settingStore = useSettingStore()
const { schoolId, schoolInfo, classComputerMac } = storeToRefs(settingStore)

let isElectron: boolean
const electron = window.electron as ElectronAPI

try {
  isElectron = !!window.electron
} catch (e) {
  isElectron = false
}

const list = ref<School[]>([])
const options = ref([])

const selectedValue = ref<number | null>(null)

const loading = ref(true)
if (isElectron) {
  electron.ipcRenderer.invoke('getSchoolList').then((res) => {
    list.value = res
    options.value = res.map((item: School) => {
      return {
        label: item.SchoolName,
        value: item.id
      }
    })
    loading.value = false
  })
}

const renderLabel: SelectRenderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: list.value.find((item: School) => item.id === option.value)?.LogoUrl,
        round: true,
        size: 'small'
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0'
          }
        },
        [h('div', null, [option.label as string])]
      )
    ]
  )
}

const updateValue = (value: number) => {
  selectedValue.value = value
  schoolId.value = value
  schoolInfo.value = list.value.find((item: School) => item.id === value) as School
}
</script>

<template>
  <n-text type="error">
    敬告：本功能数据均来自第三方服务，请确保您有资格使用该提供商提供的服务（下方的学校列表中包含您所在学校），本软件开发者不对其数据准确性负责，同时不承担您使用该服务所造成的一切后果
  </n-text>
  <n-space vertical>
    <n-space class="config-item">
      <p>学校选择</p>
      <n-select
        v-model:value="schoolId"
        filterable
        placeholder="选择学校"
        :options="options"
        :render-label="renderLabel"
        :loading="loading"
        :on-update-value="updateValue"
      />
    </n-space>
    <n-space class="config-item">
      <p>班牌MAC地址</p>
      <n-input v-model:value="classComputerMac" />
    </n-space>
  </n-space>
</template>

<style scoped>
.config-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 20rem;
  width: 40%;
}
</style>
