<script setup>
import { computed, ref } from 'vue'
import { remToPx } from '../assets/script/util'
import { usePersonStore } from '../stores/person'
import { useGroupStore } from '../stores/group'
import { useSettingStore } from '../stores/setting'
import { storeToRefs } from 'pinia'
import { getAvatar } from '../utils/AvatarUtil'

import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useScoreStore } from '../stores/score'
import { useRoute, useRouter } from 'vue-router'

use([
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  TitleComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  ToolboxComponent,
])

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const scoreStore = useScoreStore()
const { scoreHistories } = storeToRefs(scoreStore)

const route = useRoute()
const router = useRouter()

const current = ref(null)
const keyword = ref('')
const displayType = ref('class')

const displayTypes = [
  {
    name: '全班',
    key: 'class',
  },
  {
    name: '小组',
    key: 'group',
  },
  {
    name: '个人',
    key: 'person',
  },
]

const displayList = computed(() => {
  switch (displayType.value)
  {
    case 'class':
      current.value = null
      return []
    case 'group':
      return groups.value.filter(item => item.name.includes(keyword.value))
    case 'person':
    default:
      return personList.value.filter(item => item.name.includes(keyword.value))
  }
})

const handler = (item) => {
  current.value = item
  router.push({
    name: 'scoreReportDetail',
    query: { type: ('members' in item) ? 'group' : 'person', uniqueId: item.uniqueId },
  })
}
const firstHistoryTime = new Date(scoreHistories?.value[scoreHistories.value?.length - 1]?.time).toLocaleString()

const option1 = ref({
  title: {
    text: '各小组评分比较',
    subtext: `从${ firstHistoryTime }至今`,
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: groups.value.map(item => item.name),
      axisTick: {
        alignWithLabel: true,
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
  ],
  series: [
    {
      name: '分数',
      type: 'bar',
      barWidth: '60%',
      data: groups.value.map(item => item.score),
    },
  ],
})

const allRates = [...new Set(scoreHistories.value.map(item => item.forWhat))]
const data1 =
  allRates.map(
    r => scoreHistories
      .value
      .filter(s => s.forWhat === r))
          .map(item => item
            .reduce(
              (accumulator, currentValue) => {return accumulator + currentValue.score}, 0))
          .map((sum, index) => ({ value: sum, name: allRates[index] }),
          )

const option2 = ref({
  title: {
    text: '各评分项占比',
    subtext: `从${ firstHistoryTime }至今`,
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  legend: {
    left: 'center',
    top: 'bottom',
    data: [
      ...allRates,
    ],
  },
  toolbox: {
    show: true,
    feature: {
      mark: { show: true },
      dataView: { show: true, readOnly: false },
      restore: { show: true },
      saveAsImage: { show: true },
    },
  },
  series: [
    {
      name: '各评分项总数',
      type: 'pie',
      radius: [20, 140],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5,
      },
      data: [
        ...data1,
      ],
    },
  ],
})

const rKey = ref(Math.random())

window.addEventListener('resize', () => setTimeout(() => rKey.value = Math.random(), 100))

</script>

<template>
  <n-layout style="height: 100%;">
    <n-layout-header>
      <div style="display: flex;flex-direction: row; align-items: center;justify-content: space-around">
        <p style="font-size: 1.5rem;margin: 0 auto 0.5rem;">评分记录</p>
      </div>
    </n-layout-header>
    <n-layout has-sider>
      <n-layout-sider :width="remToPx(10)" position="static" :collapsed="displayType==='class'" :collapsed-width="0">
        <n-input-group>
          <n-input clearable v-model:value="keyword" :style="{ width: '100%' }" size="small" placeholder="搜索"
                   class="mb-1" />
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
          <div style="height: calc(100vh - 5.5rem);display: flex;flex-direction: column;justify-content: center"
               v-if="displayList.length===0">
            <n-empty description="无数据">
            </n-empty>
          </div>
        </n-scrollbar>
      </n-layout-sider>
      <n-layout-content content-style="width:100%">
        <n-button-group>
          <n-button v-for="item in displayTypes" @click="displayType=item.key" size="small" class="mx-4">
            {{ item.name }}
          </n-button>
        </n-button-group>
        <span v-if="current!==null">{{ current?.name }} 的得分情况</span>
        <div style="width: 100%;height: calc(100% - 2rem);display:flex;justify-content: center;align-items: center">
          <div style="display: flex; height: 100%;width: 100%;" v-if="displayType==='class'">
            <n-grid :x-gap="remToPx(0.75)" :y-gap="remToPx(0.75)" :cols="2">
              <n-grid-item>
                <v-chart class="chart" :option="option1" />
              </n-grid-item>
              <n-grid-item>
                <v-chart class="chart" :option="option2" />
              </n-grid-item>
            </n-grid>
          </div>
          <div style="width: 100%;height: 100%; margin: auto;" v-else>
            <n-result v-if="current===null" status="404" title="暂无报告" description="请点击左侧列表以选择" />
            <router-view v-else :key="rKey" />
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>

</style>