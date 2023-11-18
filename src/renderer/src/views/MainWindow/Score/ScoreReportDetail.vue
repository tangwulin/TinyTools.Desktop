<script setup lang="ts">
import { from, useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useMessage } from 'naive-ui'
import { computed, toRaw } from 'vue'
import VChart from 'vue-echarts'
import { useRoute } from 'vue-router'
import { AppDatabase } from '../../../db'
import { Group } from "../../../types/group";
import { Person } from "../../../types/person";
import { ScoreHistory } from '../../../types/scoreHistory'

const db = AppDatabase.getInstance()

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])

const message = useMessage()

const scoreHistories = useObservable(from(liveQuery(() => db.scoreHistories.toArray())))

const groups = useObservable(from(liveQuery(() => db.groups.toArray())))

const personList = useObservable(from(liveQuery(() => db.persons.toArray())))

const route = useRoute()

const current = computed(() => {
  return scoreHistories?.value?.filter((item) => item.ownerId === parseInt(<string>route.query.id))
})

const allRates = computed(() => [...new Set(current.value?.map((item) => item.description))])
const fullData = computed(() =>
  allRates.value
    .map((r) => current.value?.filter((s) => s.description === r))
    .map(
      (item) =>
        item?.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.score
        }, 0)
    )
    .map((sum, index) => ({
      value: sum,
      name: allRates.value[index]
    }))
)

const positiveData = computed(() => fullData.value.filter((item) => (item.value as number) >= 0))
const negativeData = computed(() =>
  fullData.value
    .filter((item) => (item.value as number) < 0)
    .map((item) => ({
      ...item,
      value: Math.abs(item.value as number)
    }))
)

const firstHistoryTime = new Date(
  (scoreHistories?.value as ScoreHistory[])[0]?.timestamp ?? 0
).toLocaleString()

const option2 = computed(() => ({
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
    data: [...toRaw(allRates.value)]
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
      roseType: 'area',
      itemStyle: {
        borderRadius: 5
      },
      data: [...toRaw(positiveData.value)]
    },
    {
      name: '待改进',
      type: 'pie',
      radius: [20, 140],
      center: ['75%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5
      },
      data: [...toRaw(negativeData.value)]
    }
  ]
}))

const deleteHandler = (x) => {
  // scoreHistories.value = scoreHistories.value.filter((item) => item.time !== x.time)
  db.scoreHistories.delete(x.time)
  switch (x.ownerType) {
    case 'group':
      (groups.value?.find((item) => item.id === x.owner) as Group).score -= x.score
      break
    case 'person':
      (personList.value?.find((item) => item.id === x.owner) as Person).score -= x.score
      break
    default:
      message.error('出错了，请检查类型是否正确')
      break
  }
  message.success('操作成功')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100%; width: 100%">
    <n-scrollbar
      style="display: flex; flex-direction: column; height: calc(100vh - 5rem); width: 100%"
    >
      <v-chart style="height: 70vh" :option="option2" />
      <div>
        <n-list hoverable>
          <n-list-item v-for="item in current">
            <n-space justify="space-between">
              <span>{{ item.description }}</span>
              <div style="width: 14rem; display: flex; justify-content: space-between">
                <p style="padding: 0.25rem">{{ new Date(item.timestamp).toLocaleString() }}</p>
                <span
                  :style="{ color: item.score >= 0 ? '#2080f0' : '#d03050', padding: '0.25rem' }"
                  >{{ item.score }}</span
                >
                <n-popconfirm @positive-click="deleteHandler(item)" @negative-click="null">
                  <template #trigger>
                    <n-button size="small" type="error">删除</n-button>
                  </template>
                  确定要删除该记录吗？
                </n-popconfirm>
              </div>
            </n-space>
          </n-list-item>
        </n-list>
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped></style>
