<script setup>
import { DiceOutline, Dice } from "@vicons/ionicons5";
import { ref, watch } from "vue";
import { usePersonStore } from "../stores/person";
import { storeToRefs } from "pinia";
import { NButton } from "naive-ui";
import { shuffle } from "lodash-es";
import raffleBgm from "../assets/audio/raffle-2.mp3";

const personStore = usePersonStore();
const { personList } = storeToRefs(personStore);

const showFastModal = ref(false);
const showAdvancedModal = ref(false);
const number = ref(1);
const isSelected = ref(false);
const selectedPerson = ref([]);
const selectedSex = ref([1, 2, 9]);
const selectionList = ref([]);

const hasHover1 = ref(false);
const hasHover2 = ref(false);

// const itemsEachRow = ref(4);

const sexes = [
  { label: "男", value: 1 },
  { label: "女", value: 2 },
  { label: "未填写", value: 9 },
]; //此处参考了GB/T 2261.1-2003

const handler = (fast) => {
  const list = fast ? personList.value : selectionList.value;
  // const len = list.length;
  // const result = [];
  // const set = new Set();
  // while (set.size < number.value) {
  //   const index = Math.floor(Math.random() * len);
  //   if (!set.has(index)) {
  //     set.add(index);
  //     result.push(list[index]);
  //   }
  // }
  // 实测发现，上述算法在数据量较大时，性能较差，故改用lodash的shuffle方法
  showFastModal.value = false;
  showAdvancedModal.value = false;

  isSelected.value = true;
  const player = document.querySelector("audio");
  player.play();
  const interval = setInterval(() => {
    selectedPerson.value = shuffle(list).slice(0, number.value);
  }, 250);
  setTimeout(() => {
    clearInterval(interval);
  }, 3000);
};

function createOptions(x) {
  return x.map((item) => ({
    label: item.name,
    value: item.uniqueId,
    disabled: false,
  }));
}

function createValues(x) {
  return x.map((item) => item.uniqueId);
}

const options1 = ref(createOptions(personList.value));
const value1 = ref(createValues(personList.value));

selectionList.value = personList.value.filter((item) =>
  value1.value.includes(item.uniqueId)
);

watch(selectedSex, () => {
  options1.value = createOptions(
    personList.value.filter((item) => selectedSex.value.includes(item.sex))
  );
  value1.value = createValues(
    personList.value.filter((item) => selectedSex.value.includes(item.sex))
  );
});
watch(
  value1,
  () => {
    selectionList.value = personList.value.filter((item) =>
      value1.value.includes(item.uniqueId)
    );
  },
  { deep: true }
);
</script>

<template>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 6rem)">
      <div class="flex flex-col justify-center items-center h-full">
        <audio :src="raffleBgm" />
        <n-layout
          v-if="isSelected"
          content-style="display:flex;height:100%;width:100%;"
          :native-scrollbar="false"
        >
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:auto;
            "
          >
            <div
              v-for="item in selectedPerson"
              style="
                width: 8rem;
                height: 8rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
            >
              <div
                style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                "
              >
                <n-avatar
                  style="margin-bottom: 1rem"
                  size="large"
                  :src="item?.avatar"
                />
                <span style="font-size: 1.5rem">{{ item?.name }}</span>
              </div>
            </div>
          </div>
        </n-layout>
        <n-p depth="3" style="font-size: 2rem" v-else> 还没有抽选……</n-p>
      </div>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div
        style="height: 6rem"
        class="flex flex-row justify-around items-center"
      >
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
          @click="showFastModal = true"
          @mouseenter="hasHover1 = true"
          @mouseleave="hasHover1 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover1"/>
            <DiceOutline v-else/>
          </n-icon>
          <span>快速开始</span>
        </div>
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
          @click="showAdvancedModal = true"
          @mouseenter="hasHover2 = true"
          @mouseleave="hasHover2 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover2"/>
            <DiceOutline v-else/>
          </n-icon>
          <span>自定义</span>
        </div>
      </div>
    </n-layout-footer>
  </n-layout>

  <n-modal v-model:show="showFastModal">
    <n-card
      style="width: 50%"
      title="快速抽选"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showFastModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :min="1"
        :max="personList.length"
        button-placement="both"
      />
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(true)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showAdvancedModal">
    <n-card
      style="width: 50%; overflow-y: auto; overflow-x: hidden"
      title="高级抽选"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showAdvancedModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :min="1"
        :max="selectionList.length"
        button-placement="both"
      />
      <n-divider style="margin: 1rem 0" />
      <div>
        <n-collapse>
          <n-collapse-item title="性别范围" name="1">
            <n-checkbox-group v-model:value="selectedSex">
              <n-space item-style="display: flex;">
                <n-checkbox
                  v-for="sex in sexes"
                  :label="sex.label"
                  :value="sex.value"
                />
              </n-space>
            </n-checkbox-group>
          </n-collapse-item>
          <n-collapse-item title="人员范围" name="2">
            <n-transfer
              ref="transfer"
              v-model:value="value1"
              :options="options1"
              source-filterable
            />
          </n-collapse-item>
        </n-collapse>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(false)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped></style>
