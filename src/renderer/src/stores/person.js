import { ref } from "vue";
import { defineStore } from "pinia";

export const usePersonStore = defineStore('person', () => {
        const allPerson = ref([])
        return { allPerson }
    },
    {
        persist: true
    })