<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDynamicPersonList } from '../../services/DBServices/Person'

const persons = getDynamicPersonList()

const router = useRouter()

const current = ref(1)
watch(current, () => {
  switch (current.value) {
    case 1:
      router.push({ name: 'importPerson' })
      break
    case 2:
      router.push({ name: 'assignSeat' })
      break
    case 3:
      router.push({ name: 'setup schedule' })
      break
    case 4:
      router.push({ name: 'setup pptpath' })
      // router.push({ name: "setup workSchedule" });
      // router.push({ name: 'setup done' }) //后面的功能还没做好，先跳过去
      break
    case 5:
      router.push({ name: 'setup done' })
      break
    default:
      current.value = 1
      router.push({ name: 'importPerson' })
      break
  }
})
</script>

<template>
  <div>
    <n-layout style="height: 100vh; width: 100%">
      <n-layout-content style="height: calc(100% - 4rem)">
        <router-view />
      </n-layout-content>
      <n-layout-footer
        style="height: 4rem; display: flex; align-items: center; justify-content: center"
      >
        <div class="flex justify-center items-center">
          <n-space class="mt-auto" justify="space-around">
            <n-steps :current="current">
              <n-step title="添加人员" />
              <n-step title="分配座位" />
              <n-step title="导入课程表" />
              <n-step title="设置课件位置" />
              <!--        <n-step title="导入值日表" />-->
              <n-step title="完成" />
            </n-steps>
            <n-space justify="end" style="width: 12rem">
              <n-button v-if="current > 1" @click="current--">上一步</n-button>
              <n-button v-if="current < 5" :disabled="!(persons?.length !== 0)" @click="current++">
                <!--          {{ current === 4 ? "完成" : "下一步" }}-->
                下一步
              </n-button>
            </n-space>
          </n-space>
        </div>
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<style scoped></style>
