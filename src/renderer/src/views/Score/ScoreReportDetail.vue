<script setup>
import { computed, toRaw } from 'vue'
import VChart from 'vue-echarts'
import { useRoute } from 'vue-router'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { storeToRefs } from 'pinia'
import { useScoreStore } from '../../stores/score'

use([
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
])

const scoreStore = useScoreStore()
const { scoreHistories } = storeToRefs(scoreStore)

const route = useRoute()

const current = computed(() => {
  return scoreHistories.value.filter(item => item.owner === route.query.uniqueId)
})

const allRates = computed(() => [...new Set(current.value.map(item => item.forWhat))])
const fullData = computed(() => allRates.value.map(
  r => current
    .value
    .filter(s => s.forWhat === r))
                                        .map(item => item.reduce((accumulator, currentValue) => {return accumulator + currentValue.score}, 0)).map((sum, index) => ({
      value: sum,
      name: allRates.value[index],
    }),
  ))

const positiveData = computed(
  () => fullData.value.filter(item => item.value >= 0),
)
const negativeData = computed(
  () => fullData.value.filter(item => item.value < 0)
                .map(item => ({
                  ...item,
                  value: Math.abs(item.value),
                })))

const firstHistoryTime = new Date(scoreHistories?.value[scoreHistories.value?.length - 1]?.time).toLocaleString()

const option2 = computed(() => ({
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
      ...toRaw(allRates.value),
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
      name: '表扬',
      type: 'pie',
      radius: [20, 140],
      center: ['25%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5,
      },
      data: [
        ...toRaw(positiveData.value),
      ],
    },
    {
      name: '待改进',
      type: 'pie',
      radius: [20, 140],
      center: ['75%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 5,
      },
      data: [
        ...toRaw(negativeData.value),
      ],
    },
  ],
}))
</script>

<template>
  <div style="display: flex; height: 100%;width: 100%;">
    <!--    <n-grid :x-gap="remToPx(0.75)" :y-gap="remToPx(0.75)" :cols="2">-->
    <!--&lt;!&ndash;      <n-grid-item>&ndash;&gt;-->
    <!--&lt;!&ndash;        <v-chart class="chart" :option="option1" />&ndash;&gt;-->
    <!--&lt;!&ndash;      </n-grid-item>&ndash;&gt;-->
    <!--      <n-grid-item>-->
    <!--        -->
    <!--      </n-grid-item>-->
    <!--    </n-grid>-->
    <v-chart class="chart" :option="option2" />
  </div>
</template>

<style scoped>

</style>