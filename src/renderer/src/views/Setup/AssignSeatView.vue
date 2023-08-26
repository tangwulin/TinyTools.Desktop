<script setup>
import SeatTable from "../../components/SeatTable.vue";

import { useSeatStore } from "../../stores/seat";
import { storeToRefs } from "pinia";
import { debounce } from "lodash-es";
import { toRaw, ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
import { domToPng } from "modern-screenshot";


const seatStore = useSeatStore();
const { allSeats, oldRenderingList, history } = storeToRefs(seatStore);

const mode = ref(false);
const stKey = ref(Math.random());
let msgReactive = null;

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
  // isPreview.value = false;
  // if (type === "手动保存" || type === "手动更改") message.success("保存成功");
};

const updateHandler = debounce(
  () => {
    saveHistory("手动更改");
  },
  100,
  { maxWait: 2000 }
);

const save = async () => {
  msgReactive = message.create("正在生成图片……", {
    type: "loading",
    duration: 0
  });

  const target = document.getElementById("target-div");
  const options = {
    filter: (node) => {
      try
      {
        return !node.classList.contains("n-button--dashed");
      }
      catch
      {
        return true;
      }
    },
    backgroundColor: "#FFFFFF",
    scale: 3840 / target.clientWidth
  };
  // scale.value = x;
  domToPng(target, options)
    .then((dataUrl) => {
      const link = document.createElement("a");
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();
      link.download =
        "seat-" + date + "-" + time + ".png";
      link.href = dataUrl;
      link.click();
    })
    .then(() => {
      msgReactive.content = "保存成功";
      msgReactive.type = "success";
      setTimeout(() => {
        msgReactive.destroy();
        msgReactive = null;
      }, 3000);
    });
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div id="target-div" class="md:w-fit p-4" style="margin: 0 auto">
      <div class="flex items-center justify-center mb-4" v-if="!mode">
        <n-button :size="'large'">讲台</n-button>
      </div>
      <div>
        <SeatTable
          v-model:seats="allSeats"
          v-model:rendering-list="oldRenderingList"
          @update="updateHandler"
          :reverse="mode"
          :disable="mode"
          :key="stKey"
        />
      </div>
      <div class="flex items-center justify-center mt-4" v-if="mode">
        <n-button :size="'large'">讲台</n-button>
      </div>
    </div>
    <n-space vertical size="large">
      <p style="text-align: center">
        上面是系统按导入姓名的顺序自动分配的座位，如果需要调整座位，可以直接拖动座位到指定位置来交换
        <!--      ，也可以点击座位，然后点击目标位置，系统会自动调整座位。-->
      </p>
      <n-space class="flex flex-row items-center justify-center" justify="space-around">
        <n-switch class="flex flex-col items-center justify-center" v-model:value="mode"
                  @update:value="stKey=Math.random()">
          <template #checked>
            老师视角
          </template>
          <template #unchecked>
            学生视角
          </template>
        </n-switch>
        <n-button @click="save">保存图片</n-button>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>

</style>