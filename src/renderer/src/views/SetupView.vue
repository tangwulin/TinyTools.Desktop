<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { usePersonStore } from "../stores/person";
import { storeToRefs } from "pinia";

const personStore = usePersonStore();
const { personList } = storeToRefs(personStore);

const router = useRouter();

const current = ref(1);
watch(current, () => {
  switch (current.value)
  {
    case 1:
      router.push({ name: "importPerson" });
      break;
    case 2:
      router.push({ name: "assignSeat" });
      break;
    case 3:
      router.push({ name: "setup schedule" });
      break;
    case 4:
      router.push({ name: "setup workSchedule" });
      break;
    case 5:
      router.push({ name: "setup done" });
      break;
    default:
      router.push({ name: "importPerson" });
      break;
  }
});
</script>

<template>
  <div style="height: 100vh;padding: 1rem">
    <router-view />
    <!--    开始之前，我们需要填写一些必要信息-->
    <div style="position: fixed ;bottom: 1rem;left: 10%;right:auto;height: 4rem;width: 80%"
         class="flex justify-center items-center mt-auto">
      <n-steps :current="current">
        <n-step title="添加人员" />
        <n-step title="分配座位" />
        <n-step title="填写课程表" />
        <n-step title="填写值日表" />
      </n-steps>
      <n-space style="width: 12rem" justify="end">
        <n-button @click="current--" v-if="current>1">上一步</n-button>
        <n-button @click="current++" v-if="current<=4" :disabled="personList.length===0">
          {{ current === 4 ? "完成" : "下一步" }}
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<style scoped>

</style>
