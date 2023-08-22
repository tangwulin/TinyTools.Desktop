<script setup>
import { h, ref } from "vue";
import {
  NButton,
  NCard,
  NDynamicTags,
  NForm,
  NFormItem,
  NInput,
  NModal,
  useMessage,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { usePersonStore } from "../stores/person";
import { useSeatStore } from "../stores/seat";
import { getRenderingList } from "../assets/script/seatHelper";
import { useRoute } from "vue-router";
import { PlaylistAdd, Refresh } from "@vicons/tabler";

const route = useRoute();

const personStore = usePersonStore();
const seatStore = useSeatStore();
const { allPerson,personList } = storeToRefs(personStore);
const { allSeats, oldRenderingList } = storeToRefs(seatStore);

const showAddModal = ref(false);
showAddModal.value = route.query.showAddModal === "true";

const showMultiAddModal = ref(false);
showMultiAddModal.value = route.query.showMultiAddModal === "true";

if (showAddModal.value) {
  showAddModal.value = false;
  setTimeout(() => {
    showAddModal.value = true;
  }, 100);
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

if (showMultiAddModal.value) {
  showMultiAddModal.value = false;
  setTimeout(() => {
    showMultiAddModal.value = true;
  }, 100);
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

const formValue = ref({ input: "", names: [] });

const message = useMessage();

function remToPx(remValue) {
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return remValue * baseFontSize;
}

const createColumns = (edit, del) => {
  return [
    {
      title: "姓名",
      key: "name",
    },
    {
      title: "学号",
      key: "no",
    },
    {
      title: "性别",
      key: "sex",
    },
    {
      title() {
        return h("div", { class: "flex items-center justify-between" }, [
          h("div", { class: "ml-2", innerHTML: "操作" }),
          h(
            NButton,
            {
              strong: true,
              type: "warning",
              size: "small",
              class: "p-2",
              renderIcon: () => {
                return h(Refresh);
              },
              onClick: () => {
                // bgms.value = getDefaultBgm()
                message.success("重置成功");
              },
            },
            { default: () => "清空" }
          ),
          h(
            NButton,
            {
              strong: true,
              type: "primary",
              size: "small",
              class: "p-2",
              renderIcon: () => {
                return h(PlaylistAdd);
              },
              // onClick: addHandler
            },
            { default: () => "添加" }
          ),
          h(
            NButton,
            {
              strong: true,
              type: "primary",
              size: "small",
              class: "p-2",
              renderIcon: () => {
                return h(PlaylistAdd);
              },
              // onClick: addHandler
            },
            { default: () => "批量添加" }
          ),
        ]);
      },
      key: "actions",
      width: remToPx(20),
      render(row) {
        return h("div", { class: "flex flex-row" }, [
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: "small",
              onClick: () => edit(row),
            },
            { default: () => "编辑" }
          ),
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: "small",
              onClick: () => del(row),
            },
            { default: () => "删除" }
          ),
        ]);
      },
    },
  ];
};

const columns = createColumns({
  play: (row) => {
    console.log(row);
  },
});

const parseName = () => {
  formValue.value.names = formValue.value.input
    .split(/[,\s]+/)
    .filter(
      (element) => element !== undefined && element !== null && element !== ""
    );
};

const addPerson = () => {
  console.log(
    "添加了这" + formValue.value.names.length + "个人：" + formValue.value.names
  );
  allPerson.value.push(...formValue.value.names);
  message.success("添加成功，共添加了" + formValue.value.names.length + "个");
  showAddModal.value = false;
  formValue.value.names
    .map((name, index) => {
      return { name: name, index: index, isSeat: true, isDashed: false };
    })
    .forEach((item) => allSeats.value.push(item));
  oldRenderingList.value = getRenderingList(allSeats.value, []);
  formValue.value.names = [];
  formValue.value.input = "";
};
</script>

<template>
  <!--  TODO:更改为datatable-->
  <div>
    <n-space justify="space-between">
      <p>修改后请重启程序以重新生成座位</p>
      <n-button type="success" @click="showAddModal = true">批量添加</n-button>
    </n-space>
    <!--    <n-dynamic-tags-->
    <!--      v-model:value="allPerson"-->
    <!--      @update:value="message.success('修改成功')"-->
    <!--    />-->
    <n-data-table
      :columns="columns"
      :data="personList"
      :pagination="false"
      :bordered="false"
    >
    </n-data-table>

    <n-modal v-model:show="showAddModal" :mask-closable="false">
      <n-card>

      </n-card>
    </n-modal>

    <n-modal v-model:show="showMultiAddModal" :mask-closable="false">
      <n-card
        style="width: 50%"
        title="批量增加人员"
        :bordered="true"
        size="huge"
        closable
        @close="
          () => {
            showAddModal = false;
            // emit('update:showAddModal', false);
          }
        "
      >
        <n-form :label-width="80" :model="formValue">
          <n-form-item
            label="请在下方输入姓名，多个请以空格或英文逗号分割"
            path="input"
          >
            <div class="flex flex-col w-full">
              <n-text>当前已检测到：{{ formValue.names.length }}个</n-text>
              <n-input
                v-model:value="formValue.input"
                type="textarea"
                placeholder="张三,李四,王五……"
                @blur="parseName"
                @focus="parseName"
                @keyup="parseName"
              />
            </div>
          </n-form-item>
          <n-form-item label="解析到的姓名" path="names">
            <n-dynamic-tags v-model:value="formValue.names" />
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="flex">
            <NButton
              class="ml-auto"
              type="primary"
              @click="addPerson"
              :disabled="formValue.names.length === 0"
            >
              保存
            </NButton>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped></style>
