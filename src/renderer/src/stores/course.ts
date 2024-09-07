import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CourseTableItem } from '../interface/course'

export const useCourseStore = defineStore(
  'course',
  () => {
    const coursesTable = ref<CourseTableItem[]>([])
    const startWeek = ref(1)
    const speIndexOnStart = ref(0)
    const specialDay = ref(6)

    const thisCourse = ref<string>('')
    const nextCourse = ref<string>('')

    const pptPath = ref<{ subject: string; path: string }[]>([])

    function updateCourseTable(
      courses: {
        time: { start: { hour: number; minute: number }; end: { hour: number; minute: number } }
        mon: string
        tue: string
        wed: string
        thu: string
        fri: string
        spe1: string
        spe2: string
        spe3: string
        spe4: string
        spe5: string
      }[]
    ) {
      coursesTable.value = courses.map((item, index) => {
        return { order: index + 1, ...item }
      })
    }

    return {
      coursesTable,
      updateCourseTable,
      startWeek,
      speIndexOnStart,
      specialDay,
      thisCourse,
      nextCourse,
      pptPath
    }
  },
  { persist: true }
)
