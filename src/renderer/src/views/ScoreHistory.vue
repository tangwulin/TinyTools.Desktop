<script setup>
import { computed, ref } from 'vue'
import { remToPx } from '../assets/script/util'
import { useGeneralStore } from '../stores/general'
import { usePersonStore } from '../stores/person'
import { useGroupStore } from '../stores/group'
import { useSettingStore } from '../stores/setting'
import { storeToRefs } from 'pinia'
import { getAvatar } from '../utils/AvatarUtil'

const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const current = ref(null)
const keyword = ref('')

const displayTypes = [
  {
    name: '按小组',
    key: 'group',
  },
  {
    name: '按个人',
    key: 'person',
  },
]

const displayList = computed(() => {
  switch (lastScoreType.value)
  {
    case 'group':
      return groups.value.filter(item => item.name.includes(keyword.value))
    case 'person':
    default:
      return personList.value.filter(item => item.name.includes(keyword.value))
  }
})

const handler = (item) => {
  current.value = item
}
</script>

<template>
  <n-layout style="height: 100%;">
    <n-layout-header>
      <div style="display: flex;flex-direction: row; align-items: center;justify-content: space-around">
        <p style="font-size: 1.5rem;margin: 0 auto 0.5rem;">评分记录</p>
      </div>
    </n-layout-header>
    <n-layout has-sider>
      <n-layout-sider :width="remToPx(10)">
        <n-input-group>
          <n-input clearable v-model:value="keyword" :style="{ width: '100%' }" size="small" placeholder="搜索" class="mb-1"/>
        </n-input-group>
        <n-scrollbar style="height: calc(100vh - 5.5rem)">
          <n-list hoverable clickable>
            <n-list-item v-for="item in displayList" @click="handler(item)">
              <div style="display: flex; flex-direction: row;align-items: center;justify-content: start">
                <n-avatar
                  v-if="enableAvatar"
                  :src="getAvatar(item)"
                  round size="small"
                  class="mr-4"
                  :imgProps="{ referrerpolicy: 'no-referrer' }"
                  object-fit="contain"
                />
                <p>{{ item.name }}</p>
              </div>
            </n-list-item>
          </n-list>
          <div style="height: calc(100vh - 5.5rem);display: flex;flex-direction: column;justify-content: center" v-if="displayList.length===0">
            <n-empty description="真有这名字吗？" >
            </n-empty>
          </div>
        </n-scrollbar>
      </n-layout-sider>
      <n-layout-content content-style="width:100%">
        <n-button-group>
          <n-button v-for="item in displayTypes" @click="lastScoreType=item.key" size="small" class="mx-4">
            {{ item.name }}
          </n-button>
        </n-button-group>
        <span v-if="current!==null">{{ current?.name }} 的得分情况</span>
        <div style="width: 100%;height: calc(100% - 2rem);display:flex;justify-content: center;align-items: center">
          <div v-if="current!==null">

          </div>
<!--          <n-empty v-else description="请点击左侧列表以选择" >-->
<!--          </n-empty>-->
          <n-result v-else status="404" title="暂无报告" description="请点击左侧列表以选择">
          </n-result>
<!--          <n-p v-else depth="3" style="font-size: 2rem;margin-right: 8rem">请点击左侧列表以选择</n-p>-->
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>

</style>