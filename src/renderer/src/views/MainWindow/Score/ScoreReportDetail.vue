<script lang="ts" setup>
import { EChartsOption } from 'echarts'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import VChart from 'vue-echarts'
import { useRoute } from 'vue-router'
import { AppDatabase } from '../../../db'
import { RateHistory } from '../../../types/rateHistory'

const db = AppDatabase.getInstance()

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])

const message = useMessage()

const route = useRoute()

const id = computed(() => parseInt(<string>route.query.id))

const historyForThis = ref([] as RateHistory[])
db.rateHistories
  .where('ownerId')
  .equals(id.value)
  .toArray()
  .then((res) => {
    historyForThis.value = res
  })

watch(
  () => route.query.id,
  () => {
    db.rateHistories
      .where('ownerId')
      .equals(id.value)
      .toArray()
      .then((res) => {
        historyForThis.value = res
      })
  }
)

const allRates = computed(() => [...new Set(historyForThis.value?.map((item) => item.description))])
const fullData = computed(() =>
  allRates.value
    .map((r) => historyForThis.value?.filter((s) => s.description === r))
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

const positiveData = computed(() => fullData.value.filter((item) => item.value >= 0))
const negativeData = computed(() =>
  fullData.value
    .filter((item) => item.value < 0)
    .map((item) => ({
      ...item,
      value: Math.abs(item.value)
    }))
)

const firstHistoryTime = computed(() =>
  new Date(historyForThis.value?.at(0)?.timestamp ?? 0).toLocaleString()
)

const option2 = computed(
  () =>
    ({
      title: {
        text: '各评分项占比',
        subtext: `从${firstHistoryTime.value}至今`,
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
    }) as EChartsOption
)

const deleteHandler = (x: RateHistory) => {
  db.transaction('rw', db.rateHistories, db.groups, db.persons, async () => {
    db.rateHistories.delete(x.timestamp)
    switch (x.ownerType) {
      case 'group':
        db.groups
          .where('id')
          .equals(x.ownerId)
          .modify((item) => {
            item.score -= x.score
          })
        // ;(groups.value?.find((item) => item.id === x.owner) as Group).score -= x.score
        break
      case 'person':
        db.persons
          .where('id')
          .equals(x.ownerId)
          .modify((item) => {
            item.score -= x.score
          })
        // ;(persons.value?.find((item) => item.id === x.owner) as Person).score -= x.score
        break
      default:
        message.error('出错了，请检查类型是否正确')
        break
    }
  })
    .then(() => {
      db.rateHistories
        .where('ownerId')
        .equals(id.value)
        .toArray()
        .then((res) => {
          historyForThis.value = res
        })
      message.success('操作成功')
    })
    .catch((e) => {
      message.error('操作失败')
      console.error(e)
    })
}
const chart = ref()
onMounted(() => {
  setTimeout(() => {
    chart.value?.resize()
    window.addEventListener('resize', () => {
      chart.value?.resize()
    })
  }, 200)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100%; width: 100%">
    <n-scrollbar
      style="display: flex; flex-direction: column; height: calc(100vh - 5rem); width: 100%"
    >
      <v-chart ref="chart" :option="option2" style="height: 70vh" />
      <div>
        <n-list hoverable>
          <n-list-item v-for="item in historyForThis">
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
