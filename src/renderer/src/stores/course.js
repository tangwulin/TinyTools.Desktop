import { defineStore } from "pinia";
import { ref } from "vue";

export const useCourseStore = defineStore("course", () => {
  const allCourses = ref([]);

  return { allCourses };
}, { persist: true });