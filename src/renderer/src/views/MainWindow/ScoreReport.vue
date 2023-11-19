<script setup lang="ts">
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { useRouter } from 'vue-router'
import { AppDatabase } from '../../db'
import { useSettingStore } from '../../stores/setting'
import { Group } from '../../types/group'
import { Person } from '../../types/person'
import { ScoreHistory } from '../../types/scoreHistory'
import { getAvatar } from '../../utils/avatarUtil'
import remToPx from '../../utils/remToPx'

const router = useRouter()

const db = AppDatabase.getInstance()

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
  ToolboxComponent
])

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const loading = ref(true)
const percentage = ref(0)

const persons = ref<Person[]>([])
const personPromise = db.persons.toArray().then((res) => {
  persons.value = res
  percentage.value += 12
})

const groups = ref<Group[]>([])
const groupPromise = db.groups.toArray().then((res) => {
  groups.value = res
  percentage.value += 12
})

const scoreHistories = ref<ScoreHistory[]>([])
const scoreHistoryPromise = db.scoreHistories.toArray().then((res) => {
  scoreHistories.value = res
  percentage.value += 12
})

const keyword = ref('')
const displayType = ref('class')

const displayTypes = [
  {
    name: '全班',
    key: 'class'
  },
  {
    name: '小组',
    key: 'group'
  },
  {
    name: '个人',
    key: 'person'
  }
]

const displayList = computed(() => {
  switch (displayType.value) {
    case 'class':
      current.value = null
      return []
    case 'group':
      return groups?.value.filter((item) => item.name.includes(keyword.value))
    case 'person':
    default:
      return persons?.value.filter((item) => item.name.includes(keyword.value))
  }
})

const allRates = [] as string[]
let firstHistoryTime = ''

const current = ref<Person | Group | null>(null)

const option1 = ref()
const option2 = ref()
const option3 = ref()
let data1 = [] as { value: number; name: string }[]
let fullData = [] as { value: number; name: string }[]
let positiveData = [] as { value: number; name: string }[]
let negativeData = [] as { value: number; name: string }[]

Promise.all([personPromise, groupPromise, scoreHistoryPromise]).then(() => {
  firstHistoryTime = new Date(scoreHistories.value[0]?.timestamp).toLocaleString()

  allRates.push(...new Set(scoreHistories.value.map((item) => item.description)))
  percentage.value += 16

  option1.value = {
    title: {
      text: '各小组评分比较',
      subtext: `从${firstHistoryTime}至今`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: groups?.value.map((item) => item.name),
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '分数',
        type: 'bar',
        barWidth: '60%',
        data: groups?.value.map((item) => item.score)
      }
    ]
  }

  data1 = [...allRates]
    .map((r) => scoreHistories.value.filter((s) => s.description === r))
    .map((item) =>
      item.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.score
      }, 0)
    )
    .map((sum, index) => ({ value: sum, name: allRates[index] }))
  percentage.value += 16

  option2.value = {
    title: {
      text: '各评分项占比',
      subtext: `从${firstHistoryTime}至今`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      left: 'center',
      top: 'bottom',
      data: [...allRates]
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: '各评分项总数',
        type: 'pie',
        radius: [20, 140],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5
        },
        data: data1
      }
    ]
  }

  fullData = allRates
    .map((r) => scoreHistories.value.filter((s) => s.description === r))
    .map((item) =>
      item.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.score
      }, 0)
    )
    .map((sum, index) => ({
      value: sum,
      name: allRates[index]
    }))
  percentage.value += 16

  positiveData = fullData.filter((item) => item.value >= 0)
  negativeData = fullData
    .filter((item) => item.value < 0)
    .map((item) => ({
      ...item,
      value: Math.abs(item.value)
    }))
  percentage.value += 16

  option3.value = {
    title: {
      text: '各评分项占比',
      subtext: `从${firstHistoryTime}至今`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      left: 'center',
      top: 'bottom',
      data: allRates
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: '表扬',
        type: 'pie',
        radius: [20, 140],
        center: ['25%', '50%'],
        itemStyle: {
          borderRadius: 5
        },
        data: positiveData
      },
      {
        name: '待改进',
        type: 'pie',
        radius: [20, 140],
        center: ['75%', '50%'],
        itemStyle: {
          borderRadius: 5
        },
        data: negativeData
      }
    ]
  }
  loading.value = false
})

const handler = (item: Person | Group) => {
  current.value = item
  router.push({
    name: 'scoreReportDetail',
    query: { type: 'members' in item ? 'group' : 'person', id: item.id }
  })
}
</script>

<template>
  <div v-if="loading">
    <n-progress type="line" :percentage="percentage" :show-indicator="false" />
  </div>
  <n-layout style="height: 100%">
    <n-layout-header>
      <div
        style="
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
        "
      >
        <p style="font-size: 1.5rem; margin: 0 auto 0.5rem">分析报告</p>
      </div>
    </n-layout-header>
    <n-layout has-sider>
      <n-layout-sider
        :width="remToPx(10)"
        position="static"
        :collapsed="displayType === 'class'"
        :collapsed-width="0"
      >
        <n-input-group>
          <n-input
            v-model:value="keyword"
            clearable
            :style="{ width: '100%' }"
            size="small"
            placeholder="搜索"
            class="mb-1"
          />
        </n-input-group>
        <n-scrollbar style="height: calc(100vh - 5.5rem)">
          <n-list hoverable clickable>
            <n-list-item v-for="item in displayList" :key="item.id" @click="handler(item)">
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: start;
                "
              >
                <n-avatar
                  v-if="enableAvatar"
                  :src="getAvatar(item)"
                  round
                  size="small"
                  class="mr-4"
                  :img-props="{ referrerpolicy: 'no-referrer' }"
                  object-fit="contain"
                />
                <p>{{ item.name }}</p>
              </div>
            </n-list-item>
          </n-list>
          <div
            v-if="displayList.length === 0"
            style="
              height: calc(100vh - 5.5rem);
              display: flex;
              flex-direction: column;
              justify-content: center;
            "
          >
            <n-empty description="无数据"></n-empty>
          </div>
        </n-scrollbar>
      </n-layout-sider>
      <n-layout-content content-style="width:100%">
        <n-button-group>
          <n-button
            v-for="item in displayTypes"
            :key="item.key"
            size="small"
            class="mx-4"
            @click="displayType = item.key"
          >
            {{ item.name }}
          </n-button>
        </n-button-group>
        <span v-if="current !== null">{{ current?.name }} 的得分情况</span>
        <div
          style="
            width: 100%;
            height: calc(100vh - 5rem);
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <n-scrollbar v-if="displayType === 'class'">
            <div style="display: flex; flex-direction: column; height: 100%; width: 100%">
              <n-grid :x-gap="remToPx(0.75)" :y-gap="remToPx(0.75)" :cols="2" style="height: 90vh">
                <n-grid-item>
                  <v-chart class="chart" :option="option1" />
                </n-grid-item>
                <n-grid-item>
                  <v-chart class="chart" :option="option2" />
                </n-grid-item>
              </n-grid>
              <div>
                <v-chart
                  class="chart"
                  :option="option3"
                  style="height: calc(100vh - 10rem); width: 100%"
                />
              </div>
            </div>
          </n-scrollbar>
          <div v-else style="width: 100%; height: 100%; margin: auto">
            <n-result
              v-if="current === null"
              status="404"
              title="暂无报告"
              description="请点击左侧列表以选择"
            />
            <router-view v-else />
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>
