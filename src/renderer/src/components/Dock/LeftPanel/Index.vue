<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { useCourseStore } from '../../../stores/course'

const courseStore = useCourseStore()
const { coursesTable, startWeek, speIndexOnStart, specialDay, thisCourse, nextCourse } =
  storeToRefs(courseStore)

const courseNow = ref<string | null>(null)
const courseNext = ref<string | null>(null)

//获取今天星期几
const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].at(new Date().getDay()) as string
//获取今天是今年的第几周
const week = Math.ceil(
  (new Date().getTime() - new Date(new Date().getFullYear().toString()).getTime()) /
    (1000 * 60 * 60 * 24 * 7)
)

let today: string

if (new Date().getDay() === specialDay.value) {
  today = 'spe' + (week - startWeek.value + speIndexOnStart.value)
} else {
  today = day
}

let refreshTimer: NodeJS.Timer

function parseTimePairToNumber(time: { hour: number; minute: number }) {
  return time.hour * 100 + time.minute
}

function fetchCourses() {
  //获取当前是几点几分
  // const now = new Date()
  // const hour = now.getHours()
  // const minute = now.getMinutes()

  //测试用
  const hour = 10
  const minute = 40
  const nowTime = hour * 100 + minute

  //如果当前时间在课程时间内,则找到当前课程
  const courseNow = coursesTable.value.find((course) => {
    const start = parseTimePairToNumber(course.time.start)
    const end = parseTimePairToNumber(course.time.end)
    return start <= nowTime && nowTime <= end
  })

  if (courseNow) {
    const i = coursesTable.value.indexOf(courseNow)
    const courseNext = coursesTable.value[i + 1]
    return { courseNow: courseNow, courseNext: courseNext ?? null }
  }

  //如果当前时间不在课程时间内,则找到下一节课
  const courseNext = coursesTable.value.find((course) => {
    const start = parseTimePairToNumber(course.time.start)
    return start > nowTime
  })
  return { courseNow: null, courseNext: courseNext ?? null }
}

function updateCourse() {
  const { courseNow: now, courseNext: next } = fetchCourses()
  if (now) {
    courseNow.value = `${now[today]} ${now.time.start.hour}:${now.time.start.minute}-${now.time.end.hour}:${now.time.end.minute.toString().padStart(2, '0')}`
    thisCourse.value = now[today]
  } else {
    courseNow.value = '现在是下课时间'
    thisCourse.value = ''
  }
  if (next) {
    courseNext.value = `${next[today]} ${next.time.start.hour}:${next.time.start.minute}-${next.time.end.hour}:${next.time.end.minute.toString().padStart(2, '0')}`
    nextCourse.value = next[today]
  } else {
    courseNext.value = '今天没有课了'
    nextCourse.value = ''
  }
}

onMounted(() => {
  updateCourse()
  refreshTimer = setInterval(() => {
    updateCourse()
  }, 1000 * 30)
})

onUnmounted(() => {
  clearInterval(refreshTimer)
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-full"
    style="font-size: 1rem; padding: 0.5rem 0 0"
  >
    <p>
      {{ courseNow }}
    </p>
    <p>
      {{ courseNext }}
    </p>
  </div>
</template>

<style scoped></style>
