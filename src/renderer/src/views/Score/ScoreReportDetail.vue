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
import { useGroupStore } from '../../stores/group'
import { usePersonStore } from '../../stores/person'
import { useMessage } from 'naive-ui'

use([
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
])

const message = useMessage()

const scoreStore = useScoreStore()
const { scoreHistories } = storeToRefs(scoreStore)

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const route = useRoute()

const current = computed(() => {
  return scoreHistories.value.filter(item => item.owner === route.query.uniqueId)
})

const allRates = computed(() => [...new Set(current.value.map(item => item.forWhat))])
const fullData = computed(() => allRates.value.map(
  r => current
    .value
    .filter(s => s.forWhat === r))
                                        .map(
                                          item => item.reduce(
                                            (accumulator, currentValue) => {return accumulator + currentValue.score}, 0))
                                        .map((sum, index) => ({
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

const firstHistoryTime = new Date(scoreHistories?.value[0]?.time).toLocaleString()

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

const deleteHandler = (x) => {
  scoreHistories.value = scoreHistories.value.filter(item => item.time !== x.time)
  switch (x.ownerType)
  {
    case 'group':
      groups.value.find(item => item.uniqueId === x.owner).score -= x.score
      break
    case 'person':
      personList.value.find(item => item.uniqueId === x.owner).score -= x.score
      break
    default:
      message.error('出错了，请检查类型是否正确')
      break
  }
  message.success('操作成功')
}
</script>

<template>
  <div style="display: flex;flex-direction: column; height: 100%;width: 100%;">
    <n-scrollbar style="display: flex;flex-direction: column; height: calc(100vh - 5rem);width: 100%;">
      <v-chart style="height: 70vh" :option="option2" />
      <div>
        <n-list hoverable>
          <n-list-item v-for="item in current">
            <n-space justify="space-between">
              <span>{{ item.forWhat }}</span>
              <div style="width: 14rem;display: flex;justify-content: space-between">
                <p style="padding: 0.25rem;">{{ new Date(item.time).toLocaleString() }}</p>
                <span :style="{color:item.score>=0?'#2080f0':'#d03050',padding: '0.25rem'}">{{ item.score }}</span>
                <n-popconfirm
                  @positive-click="deleteHandler(item)"
                  @negative-click="null"
                >
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

<style scoped>

</style>