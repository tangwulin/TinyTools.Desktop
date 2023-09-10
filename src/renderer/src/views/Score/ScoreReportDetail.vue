<script setup>
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { useRoute } from 'vue-router'

import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useGroupStore } from '../../stores/group'
import { storeToRefs } from 'pinia'
import { useScoreStore } from '../../stores/score'

use([
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
])

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const scoreStore = useScoreStore()
const { scoreHistories } = storeToRefs(scoreStore)

const route = useRoute()

const current = computed(() => {
  return scoreHistories.value.filter(item => item.owner === route.query.uniqueId)
})

const allRates = [...new Set(current.value.map(item => item.forWhat))]
const data1 =
  allRates.map(
    r => current
      .value
      .filter(s => s.forWhat === r))
          .map(item => item
            .reduce(
              (accumulator, currentValue) => {return accumulator + currentValue.score}, 0))
          .map((sum, index) => ({ value: Math.abs(sum), name: allRates[index] }),
          )

const firstHistoryTime = new Date(scoreHistories?.value[scoreHistories.value?.length - 1]?.time).toLocaleString()

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