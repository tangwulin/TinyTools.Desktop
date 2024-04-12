import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CourseTableItem } from '../interface/course'

export const useCourseStore = defineStore(
  'course',
  () => {
    const coursesTable = ref<CourseTableItem[]>([])

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
      updateCourseTable
    }
  },
  { persist: true }
)
