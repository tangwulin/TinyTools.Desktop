import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ScoreHistory } from '../types/scoreHistory'

export const useScoreStore = defineStore(
  'score',
  () => {
    const rates = ref<
      (
        | { name: string; score: number; description?: unknown }
        | { name: string; score: number; description: string }
      )[]
    >([
      { name: '小组月考均分第一', score: 10 },
      { name: '小组月考均分第二', score: 8 },
      { name: '小组月考均分第三', score: 6 },
      { name: '小组月考均分第四', score: 4 },
      { name: '月考班级单科第一', score: 5 },
      { name: '月考班级单科第二', score: 4 },
      { name: '月考班级单科第三', score: 3 },
      { name: '月考班级单科第四', score: 2 },
      { name: '月考班级单科第五', score: 1 },
      { name: '月考班级进步第一', score: 5 },
      { name: '月考班级进步第二', score: 4 },
      { name: '月考班级进步第三', score: 3 },
      { name: '月考班级进步第四', score: 2 },
      { name: '月考班级进步第五', score: 1 },
      { name: '自习课看课外书被抓', score: -2 },
      { name: '迟到', score: -2, description: '以刷卡扣分为准' },
      { name: '旷课', score: -5, description: '' },
      { name: '值日生不打扫/未倒垃圾', score: -2, description: '以学校扣分为准' },
      { name: '宿舍卫生、纪律被扣分', score: -5, description: '以学校扣分为准' },
      { name: '未经老师同意擅自调换位置', score: -2 },
      { name: '无故不参加学校各类集会活动', score: -1, description: '以学校扣分为准' },
      { name: '不请假私自外出', score: -5, description: '真的有人能做得到吗？' },
      { name: '违纪被年级通报批评', score: -5 },
      { name: '违纪被年级处分', score: -10 },
      { name: '未经老师同意擅自调换位置', score: -2 },
      { name: '不穿校服', score: -2, description: '以学校扣分为准' },
      { name: '对老师说脏话、乱叫侮辱性绰号', score: -10, description: '以投诉受理为准' },
      { name: '做好人好事受到学校表扬', score: 2 },
      { name: '积极参与班级或学校活动', score: 2 }
    ])
    const scoreHistories = ref<ScoreHistory[]>([])
    return { rates, scoreHistories }
  }
  // { persist: { storage: localforage } }
)
