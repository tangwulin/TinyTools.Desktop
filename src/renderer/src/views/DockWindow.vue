<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { Course } from '../interface/course'
import { getTodayCourse } from '../services/LocalClassScheduleService'
import { useSettingStore } from '../stores/setting'

const setting = useSettingStore()
const { courseSource, schoolInfo, classComputerMac } = storeToRefs(setting)

const todayCourse = ref<Course[]>([])

switch (courseSource.value) {
  case 'local':
    todayCourse.value = await getTodayCourse().then((res) => res?.courses ?? [])
    break
  case 'remote':
    {
      if (schoolInfo.value && classComputerMac.value) {
        const api = new ThirdPartyAPIService(schoolInfo.value.WebApi_IP, classComputerMac.value)
        api.initClassInfo().then(() =>
          api.getCourseList().then((res) => {
            todayCourse.value = res
          })
        )
      }
    }
    break
  default:
    break
}
</script>

<template>
  <div id="dock" class="text-white flex flex-row justify-around">
    <div class="w-1/5 border-2 border-black" style="-webkit-app-region: drag">按住拖动</div>
    <div class="w-1/2 border-2 border-black">
      <p>There are transparent test page</p>
    </div>
    <div class="w-1/4 border-2 border-black">
      <p>右侧</p>
    </div>
  </div>
</template>

<style scoped>
#dock {
  background-color: rgba(0, 0, 0, 0.2);
  height: 100vh;
  width: 100vw;
  border-radius: 1rem;
  border-width: 0.5rem;
  border-color: rgba(87, 87, 87, 0);
}
</style>
