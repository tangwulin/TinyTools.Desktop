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
  NText,
  useMessage,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { usePersonStore } from "../stores/person";
import { useSeatStore } from "../stores/seat";
import { getRenderingList } from "../assets/script/seatHelper";
import { useRoute } from "vue-router";
import {
  PlaylistAdd,
  TableImport as ImportIcon,
  File as FileIcon,
} from "@vicons/tabler";
import { PersonAdd20Filled as PersonAddIcon } from "@vicons/fluent";
import { generateUniqueId } from "../assets/script/util";
import * as XLSX from "xlsx";

const route = useRoute();

const personStore = usePersonStore();
const seatStore = useSeatStore();
const { personList } = storeToRefs(personStore);
const { allSeats, oldRenderingList } = storeToRefs(seatStore);

const showAddModal = ref(false);
showAddModal.value = route.query.showAddModal === "true";

const showMultiAddModal = ref(false);
showMultiAddModal.value = route.query.showMultiAddModal === "true";

const showImportModal = ref(false);

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

const isEdit = ref(false);

const formValue = ref({
  name: "",
  number: "",
  sex: 9,
  uniqueId: generateUniqueId(),
});
const multiAddForm = ref({ input: "", names: [] });

const message = useMessage();

function remToPx(remValue) {
  const baseFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return remValue * baseFontSize;
}

const sexes = [
  { label: "男", value: 1 },
  { label: "女", value: 2 },
  { label: "未填写", value: 9 },
]; //此处参考了GB/T 2261.1-2003

const editHandler = (row) => {
  formValue.value = { ...row };
  isEdit.value = true;
  showAddModal.value = true;
};

const deleteHandler = (row) => {
  personList.value = personList.value.filter(
    (item) => item.uniqueId !== row.uniqueId
  );
  message.success("删除成功");
};
const createColumns = (edit, del) => {
  return [
    {
      title: "姓名",
      key: "name",
    },
    {
      title: "学号",
      key: "number",
    },
    {
      title: "性别",
      key: "sex",
      render(row) {
        switch (row.sex) {
          case 1:
            return "男";
          case 2:
            return "女";
          default:
            return h(NText, { depth: 3 }, { default: () => "未填写" });
        }
      },
    },
    {
      title: "操作",
      key: "actions",
      width: remToPx(8),
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

const renderCell = (value) => {
  if (!value) {
    return h(NText, { depth: 3 }, { default: () => "未填写" });
  }
  return value;
};

const columns = createColumns(editHandler, deleteHandler);

const parseName = () => {
  multiAddForm.value.names = multiAddForm.value.input
    .split(/[,\s]+/)
    .filter(
      (element) => element !== undefined && element !== null && element !== ""
    );
};

const addPerson = () => {
  console.log(
    "添加了这" +
      multiAddForm.value.names.length +
      "个人：" +
      multiAddForm.value.names
  );
  personList.value.push(
    ...multiAddForm.value.names.map((name) => ({
      name: name,
      number: "",
      sex: 9,
      uniqueId: generateUniqueId(),
    }))
  );
  message.success(
    "添加成功，共添加了" + multiAddForm.value.names.length + "个"
  );
  showAddModal.value = false;
  multiAddForm.value.names
    .map(name => {
      return { name: name, isSeat: true, isDashed: false };
    })
    .forEach((item) => allSeats.value.push(item));
  oldRenderingList.value = getRenderingList(allSeats.value, []);
  multiAddForm.value.names = [];
  multiAddForm.value.input = "";
};

const handler = () => {
  if (isEdit.value) {
    personList.value = personList.value.map((item) => {
      if (item.uniqueId === formValue.value.uniqueId) {
        return formValue.value; // 使用展开语法更新 title 属性
      }
      return item; // 非匹配的元素保持原样
    });
    message.success("编辑成功");
  } else {
    personList.value.push({ ...formValue.value, uniqueId: generateUniqueId() });
    message.success("添加成功");
  }
  showAddModal.value = false;
};

const parseExcel = async (uploadFileInfo) => {
  const file = uploadFileInfo.file.file;
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetNames = workbook.SheetNames; // 工作表名称集合
  const worksheet = workbook.Sheets[sheetNames[0]]; // 这里我们只读取第一张sheet
  const json = XLSX.utils.sheet_to_json(worksheet);
  const persons = json
    .map((item) => {
      if (item.姓名 === undefined || item.姓名 === null || item.姓名 === "")
        return null;
      return {
        name: item.姓名,
        sex: item.性别 === "男" ? 1 : item.性别 === "女" ? 2 : 9,
        number: JSON.stringify(item.学号),
      };
    })
    .filter((item) => item !== null);
  if (persons.length === 0) {
    message.error("未检测到任何人员信息，请检查文件格式是否正确");
  } else {
    personList.value.push(
      ...persons.map((person) => ({
        ...person,
        uniqueId: generateUniqueId(),
      }))
    );
    message.success("导入成功");
    showImportModal.value = false;
  }
};

const tableHeight = ref(window.innerHeight - remToPx(6));
window.addEventListener("resize", () => {
  tableHeight.value = window.innerHeight - remToPx(6);
});
</script>

<template>
  <n-space justify="space-between">
    <p>修改后请重启程序以重新生成座位</p>
    <n-space>
      <n-button
        type="primary"
        size="small"
        class="p-2"
        @click="showImportModal = true"
      >
        <template #icon>
          <n-icon>
            <ImportIcon />
          </n-icon>
        </template>
        导入
      </n-button>
      <n-button
        type="primary"
        size="small"
        class="p-2"
        @click="showAddModal = true"
      >
        <template #icon>
          <n-icon>
            <PersonAddIcon />
          </n-icon>
        </template>
        添加
      </n-button>
      <n-button
        type="primary"
        size="small"
        class="p-2"
        @click="showMultiAddModal = true"
      >
        <template #icon>
          <n-icon>
            <PlaylistAdd />
          </n-icon>
        </template>
        批量添加
      </n-button>
    </n-space>
  </n-space>
  <n-data-table
    :columns="columns"
    :data="personList"
    :pagination="false"
    :bordered="false"
    :render-cell="renderCell"
    :max-height="tableHeight"
  >
  </n-data-table>

  <n-modal v-model:show="showAddModal" :mask-closable="false">
    <n-card
      style="width: 50%"
      :title="isEdit ? '编辑人员' : '添加人员'"
      :bordered="true"
      size="huge"
      closable
      @close="
        () => {
          showAddModal = false;
          if (isEdit)
            formValue = {
              name: '',
              number: '',
              sex: 9,
              uniqueId: generateUniqueId(),
            };
          isEdit = false;
        }
      "
    >
      <n-form>
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="formValue.name" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="学号（可选）" path="number">
          <n-input v-model:value="formValue.number" placeholder="输入学号" />
        </n-form-item>
        <n-form-item label="性别（可选）" path="sex">
          <n-radio-group v-model:value="formValue.sex">
            <n-space>
              <n-radio v-for="sex in sexes" :key="sex.value" :value="sex.value">
                {{ sex.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <div class="flex justify-end">
        <n-button
          type="primary"
          :disabled="formValue.name.length === 0"
          @click="handler"
          >保存
        </n-button>
      </div>
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
          showMultiAddModal = false;
        }
      "
    >
      <n-form :label-width="80" :model="multiAddForm">
        <n-form-item
          label="请在下方输入姓名，多个请以空格或英文逗号分割"
          path="input"
        >
          <div class="flex flex-col w-full">
            <n-text>当前已检测到：{{ multiAddForm.names.length }}个</n-text>
            <n-input
              v-model:value="multiAddForm.input"
              type="textarea"
              placeholder="张三,李四,王五……"
              @blur="parseName"
              @focus="parseName"
              @keyup="parseName"
            />
          </div>
        </n-form-item>
        <n-form-item label="解析到的姓名" path="names">
          <n-dynamic-tags v-model:value="multiAddForm.names" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex">
          <NButton
            class="ml-auto"
            type="primary"
            @click="addPerson"
            :disabled="multiAddForm.names.length === 0"
          >
            保存
          </NButton>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showImportModal" :mask-closable="false">
    <n-card
      style="width: 50%"
      title="导入人员"
      :bordered="true"
      size="huge"
      closable
      @close="showImportModal = false"
    >
      <n-upload
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        directory-dnd
        action=""
        :on-before-upload="
          (fileInfo) => {
            parseExcel(fileInfo);
          }
        "
        :default-upload="false"
        :max="1"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <file-icon />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            点击或者拖动文件到该区域来导入人员
          </n-text>
        </n-upload-dragger>
      </n-upload>
      <template #footer>
        <div class="flex">
          <NButton
            class="ml-auto"
            type="primary"
            @click="addPerson"
            :disabled="multiAddForm.names.length === 0"
          >
            保存
          </NButton>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped></style>
