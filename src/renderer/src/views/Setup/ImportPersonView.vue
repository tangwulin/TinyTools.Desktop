<script setup>
import PersonManageView from "../PersonManageView.vue";
import { onBeforeRouteLeave } from "vue-router";

import { usePersonStore } from "../../stores/person";
import { useSeatStore } from "../../stores/seat";
import { storeToRefs } from "pinia";
import { getRenderingList } from "../../assets/script/seatHelper";
import { toRaw } from "vue";

const personStore = usePersonStore();
const seatStore = useSeatStore();

const { personList } = storeToRefs(personStore);
const { allSeats, oldRenderingList, history } = storeToRefs(seatStore);

const saveHistory = (type) => {
  const data = {
    time: Date.now(),
    allSeats: [
      ...toRaw(
        allSeats.value.slice().map((item) => {
          return { ...item, color: null };
        })
      )
    ],
    oldRenderingList: [
      ...toRaw(oldRenderingList.value)
        .slice()
        .map((item) => {
          return { ...item, color: null };
        })
    ],
    isCurrent: true,
    type: type || "???"
  };
  history.value = history.value.map((item) => {
    return { ...item, isCurrent: false };
  });
  if (history.value.length !== 0 && (history.value[0].type === "手动更改" || history.value[0].type === "初始位置"))
  {
    if (data.time - history.value[0].time > 60 * 1000 && history.value[0].type !== "初始位置")
      history.value.unshift(data);
    else history.value[0] = data;
  }
  else
  {
    history.value = history.value.map((item) => {
      return { ...item, isCurrent: false, isShowing: false };
    });
    history.value.unshift(data);
  }
};

onBeforeRouteLeave(() => {
  if (personList.value.length === 0)
    return false;
  else
  {
    allSeats.value = personList.value.map((item, index) => {
      return { name: item.name, index: index, isSeat: true };
    });
    oldRenderingList.value = getRenderingList(allSeats.value, []);
    saveHistory("初始位置");
  }
});
</script>

<template>
  <div class="flex justify-center items-center">
    <div style="max-height: 80vh;overflow:hidden;">
      <person-manage-view />
    </div>
  </div>
</template>

<style scoped>

</style>