<script lang="ts" setup>
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
import { computed, onMounted, ref, watch } from 'vue'
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
      // current.value = null
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
let data1 = [] as { value: number; name: string }[]
let fullData = [] as { value: number; name: string }[]
let positiveData = [] as { value: number; name: string }[]
let negativeData = [] as { value: number; name: string }[]

Promise.all([personPromise, groupPromise, scoreHistoryPromise]).then(() => {
  firstHistoryTime = new Date(scoreHistories.value[0]?.timestamp).toLocaleString()

  allRates.push(...new Set(scoreHistories.value.map((item) => item.description)))
  percentage.value += 16

  data1 = [...allRates]
    .map((r) => scoreHistories.value.filter((s) => s.description === r))
    .map((item) =>
      item.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.score
      }, 0)
    )
    .map((sum, index) => ({ value: sum, name: allRates[index] }))
  percentage.value += 16

  option1.value = {
    title: {
      text: '数据总览',
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
        name: '各小组评分比较',
        type: 'bar',
        center: ['25%', '50%'],
        barWidth: '60%',
        data: groups?.value.map((item) => item.score)
      },
      {
        name: '各评分项总数',
        type: 'pie',
        radius: [20, 140],
        center: ['75%', '50%'],
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
})

const handler = (item: Person | Group) => {
  current.value = item
  router.push({
    name: 'scoreReportDetail',
    query: { type: 'members' in item ? 'group' : 'person', id: item.id }
  })
}

const chart1Ref = ref()
const chart2Ref = ref()

const drawCharts = () => {
  chart1Ref.value?.resize()
  chart2Ref.value?.resize()
}

onMounted(() => {
  setTimeout(() => {
    drawCharts()
    window.addEventListener('resize', () => {
      drawCharts()
    })
  }, 200)
})

watch(
  () => displayType.value,
  () => {
    setTimeout(() => {
      drawCharts()
    }, 200)
  }
)
</script>

<template>
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
        :collapsed="displayType === 'class'"
        :collapsed-width="0"
        :width="remToPx(10)"
        position="static"
      >
        <n-input-group>
          <n-input
            v-model:value="keyword"
            :style="{ width: '100%' }"
            class="mb-1"
            clearable
            placeholder="搜索"
            size="small"
          />
        </n-input-group>
        <n-scrollbar style="height: calc(100vh - 5.5rem)">
          <n-list clickable hoverable>
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
                  :img-props="{ referrerpolicy: 'no-referrer' }"
                  :src="getAvatar(item)"
                  class="mr-4"
                  object-fit="contain"
                  round
                  size="small"
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
            class="mx-4"
            size="small"
            @click="displayType = item.key"
          >
            {{ item.name }}
          </n-button>
        </n-button-group>
        <span v-if="current !== null && displayType !== 'class'"
          >{{ current?.name }} 的得分情况</span
        >
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
            <div
              style="
                display: flex;
                flex-direction: column;
                height: calc(2 * (100vh - 5rem));
                width: 100%;
              "
            >
              <v-chart
                ref="chart1Ref"
                :option="option1"
                style="height: calc(100vh - 5rem); width: 100%"
              ></v-chart>
              <v-chart
                ref="chart2Ref"
                :option="option2"
                style="height: calc(100vh - 5rem); width: 100%"
              ></v-chart>
            </div>
          </n-scrollbar>
          <div v-else style="width: 100%; height: 100%; margin: auto">
            <n-result
              v-if="current === null"
              description="请点击左侧列表以选择"
              status="404"
              title="暂无报告"
            />
            <router-view v-else />
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>
