<script lang="ts" setup>
import { Component, h, Ref, ref } from "vue";
import { NAvatar, NButton, NPopover, NSwitch, NTag, NText, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '../../stores/setting'
import { useRoute } from 'vue-router'
import { File as FileIcon, PlaylistAdd, TableImport as ImportIcon } from '@vicons/tabler'
import { PersonAdd20Filled as PersonAddIcon } from '@vicons/fluent'
import downloadAnyFile from '../../utils/downloadAnyFile'
import remToPx from '../../utils/remToPx'
import * as XLSX from 'xlsx'

// @ts-ignore:2307
import personXlsx from '../../assets/xlsx/person.xlsx'
import { getAvatar } from '../../utils/avatarUtil'
import { useScoreStore } from '../../stores/score'
import { Person } from '../../types/person'
import { liveQuery } from 'dexie'
import { from, useObservable } from '@vueuse/rxjs'
import deepcopy from 'deepcopy'

import { AppDatabase } from '../../db'
import { Group } from '../../types/group'
import { asyncComputed } from '@vueuse/core'

const db = AppDatabase.getInstance()

const route = useRoute()

const settingStore = useSettingStore()
const scoreStore = useScoreStore()
const { enableFallbackAvatar } = storeToRefs(settingStore)
const { scoreHistories } = storeToRefs(scoreStore)

const loading = asyncComputed(() => persons.value.length === 0, true)

const persons = useObservable(
  from(
    liveQuery(() =>
      db.persons.toArray().then((result) => {
        loading.value = false
        return result
      })
    )
  )
) as Readonly<Ref<Person[]>>
const groups = useObservable(from(liveQuery(() => db.groups.toArray()))) as Readonly<Ref<Group[]>>

const loading = asyncComputed(() => persons.value.length === 0, true)

const showAddModal = ref(false)
showAddModal.value = route.query.showAddModal === 'true'

const showMultiAddModal = ref(false)
showMultiAddModal.value = route.query.showMultiAddModal === 'true'

const showImportModal = ref(false)

if (showAddModal.value) {
  showAddModal.value = false
  setTimeout(() => {
    showAddModal.value = true
  }, 100)
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

if (showMultiAddModal.value) {
  showMultiAddModal.value = false
  setTimeout(() => {
    showMultiAddModal.value = true
  }, 100)
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

const isEdit = ref(false)

const formValue = ref<Person>(new Person('', 9, ''))
const multiAddForm = ref<{
  input: string
  names: string[]
}>({ input: '', names: [] })

const message = useMessage()

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 }
] //此处参考了GB/T 2261.1-2003

const editHandler = (row: Person) => {
  formValue.value = { ...row }
  isEdit.value = true
  showAddModal.value = true
}

const deleteHandler = (row: Person) => {
  db.persons.delete(row.id as number)
  scoreHistories.value = scoreHistories.value.filter((item) => item.ownerId !== <number>row.id)
  //TODO: 删除人员时删除记分记录
  message.success('删除成功')
}

const createColumns = (edit: (row: Person) => void, del: (row: Person) => void) => {
  return [
    {
      title() {
        return h('div', { class: 'flex items-center justify-between' }, [
          h(
            NPopover,
            { trigger: 'click' },
            {
              trigger: () => h('div', { innerHTML: '头像' }),
              default: () =>
                h('div', { class: 'flex flex-row items-center justify-between' }, [
                  h('div', { innerHTML: '启用内置头像', class: 'mr-2' }),
                  h(NSwitch, {
                    value: enableFallbackAvatar.value,
                    ['onUpdate:value']: (value) => {
                      enableFallbackAvatar.value = value
                    }
                  })
                ])
            }
          )
        ])
      },
      key: 'avatar',
      render(row: Person) {
        const avatarSrc = getAvatar(row)
        return h(
          NAvatar as Component,
          {
            size: 'large',
            src: avatarSrc,
            imgProps: { referrerpolicy: 'no-referrer' },
            lazy: true,
            objectFit: 'contain',
            round: true
          },
          undefined
        )
        // typeof avatarSrc === null ? row.name : undefined)
      },
      width: remToPx(4)
    },
    {
      title: '姓名',
      key: 'name',
      width: remToPx(6),
      sortOrders: ['ascend', 'descend'],
      sorter(row1: Person, row2: Person) {
        return row1.name.localeCompare(row2.name)
      }
    },
    {
      title: '性别',
      key: 'gender',
      render(row: Person) {
        switch (row.genderCode) {
          case 1:
            return '男'
          case 2:
            return '女'
          default:
            return h(NText, { depth: 3 }, { default: () => '未填写' })
        }
      },
      width: remToPx(5),
      filterMultiple: true,
      filterOptionValues: null,
      filterOptions: [
        { label: '男', value: 1 },
        { label: '女', value: 2 },
        { label: '未填写', value: 9 }
      ],
      filter(value: number[], row: Person) {
        return value.includes(row.genderCode)
      }
    },
    {
      title: '学号',
      key: 'number',
      width: remToPx(10),
      sortOrders: ['ascend', 'descend'],
      sorter(row1: Person, row2: Person) {
        return row1.name.localeCompare(row2.name)
      }
    },
    {
      title: '分组',
      key: 'groups',
      render(row: Person) {
        const groupTags = groups.value
          ?.map((item) =>
            item.members
              .map((member) => member.id)
              .flat()
              .includes(row.id as number)
              ? h(
                  NTag,
                  { bordered: false, class: 'm-1' },
                  {
                    default: () =>
                      // groups.value.find((g) => g.uniqueId === item)?.name ??
                      // h(NText, { depth: 3 }, { default: () => '已删除' })
                      item.name
                  }
                )
              : null
          )
          .filter((item) => item !== null)
        return groupTags?.length
          ? h('div', { class: 'flex flex-row items-center justify-start' }, groupTags)
          : h(NText, { depth: 3 }, { default: () => '未加入' })
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: remToPx(8),
      render(row: Person) {
        return h('div', { class: 'flex flex-row' }, [
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: 'small',
              onClick: () => edit(row)
            },
            { default: () => '编辑' }
          ),
          h(
            NButton,
            {
              strong: true,
              tertiary: true,
              size: 'small',
              onClick: () => del(row)
            },
            { default: () => '删除' }
          )
        ])
      }
    }
  ]
}

const renderCell = (value: any) => {
  if (!value) {
    return h(NText, { depth: 3 }, { default: () => '未填写' })
  }
  return value
}

const columns = createColumns(editHandler, deleteHandler)

const parseName = () => {
  multiAddForm.value.names = multiAddForm.value.input
    .split(/[,\s]+/)
    .filter((element) => element !== undefined && element !== null && element !== '')
}

const addPerson = () => {
  console.log('添加了这' + multiAddForm.value.names.length + '个人：' + multiAddForm.value.names)

  const newPerson = multiAddForm.value.names.map((name) => new Person(name, 9, ''))
  db.persons.bulkPut(newPerson)

  message.success('添加成功，共添加了' + multiAddForm.value.names.length + '个')

  showAddModal.value = false
  //TODO: 为新添加的人员分配座位
  multiAddForm.value.names = []
  multiAddForm.value.input = ''
}

const handler = () => {
  try {
    db.persons.put(deepcopy(formValue.value))
    message.success(isEdit.value ? '编辑成功' : '添加成功')
  } catch (e) {
    message.error('保存失败')
    message.error(JSON.stringify(e))
  }
  showAddModal.value = false
}

const parseExcel = async (uploadFileInfo: any) => {
  const file = uploadFileInfo.file.file
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetNames = workbook.SheetNames // 工作表名称集合
  const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet
  const json = XLSX.utils.sheet_to_json(worksheet)
  const personsFromExcel = json
    .map((item: any) => {
      if (item['姓名'] === undefined || item['姓名'] === null || item['姓名'] === '') return
      // return {
      //   name: item['姓名'],
      //   sex: item['性别'] === '男' ? 1 : item['性别'] === '女' ? 2 : 9,
      //   number: JSON.stringify(item['学号']),
      //   group: []
      // }
      return new Person(
        item['姓名'],
        item['性别'] === '男' ? 1 : item['性别'] === '女' ? 2 : 9,
        JSON.stringify(item['学号'])
      )
    })
    .filter((item): item is Person => item !== null)

  if (personsFromExcel.length === 0) {
    message.error('未检测到任何人员信息，请检查文件格式是否正确')
  } else {
    // persons.value.push(
    //   // ...personsFromExcel.map((person) => ({
    //   //   ...person,
    //   //   uniqueId: genUniqueId()
    //   // }))
    //   // personsFromExcel.map(item)
    //   ...personsFromExcel
    // )
    db.persons.bulkPut(personsFromExcel)
    message.success('导入成功')
    showImportModal.value = false
  }
}

const tableHeight = ref(window.innerHeight - remToPx(5.5))
window.addEventListener('resize', () => {
  tableHeight.value = window.innerHeight - remToPx(5.5)
})

const downloadTemplate = () => {
  downloadAnyFile(personXlsx, '人员导入模板.xlsx')
}

// function createOptions(x) {
//   return x.map((item) => ({ label: item.name, value: item.uniqueId }))
// }
</script>

<template>
  <n-space justify="space-between">
    <p>{{ route.name === 'personManage' ? '修改后请重启程序以重新生成座位' : '' }}</p>
    <n-space>
      <n-button class="p-2" size="small" type="primary" @click="showImportModal = true">
        <template #icon>
          <n-icon>
            <ImportIcon />
          </n-icon>
        </template>
        导入
      </n-button>
      <n-button class="p-2" size="small" type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon>
            <PersonAddIcon />
          </n-icon>
        </template>
        添加
      </n-button>
      <n-button class="p-2" size="small" type="primary" @click="showMultiAddModal = true">
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
    :bordered="false"
    :columns="columns"
    :data="persons"
    :max-height="tableHeight"
    :pagination="false"
    :render-cell="renderCell"
    :loading="loading"
  >
  </n-data-table>

  <n-modal v-model:show="showAddModal" :mask-closable="false">
    <n-card
      :bordered="true"
      :title="isEdit ? '编辑人员' : '添加人员'"
      closable
      size="huge"
      style="width: 50%"
      @close="
        () => {
          showAddModal = false
          if (isEdit) formValue = new Person('', 9, '')
          isEdit = false
        }
      "
    >
      <n-scrollbar
        style="max-height: 70vh; overflow-x: hidden; padding: 0 1rem 0 0; margin: 0 0 1rem 0"
      >
        <n-form>
          <n-form-item label="头像" path="avatar">
            <n-input v-model:value="formValue.avatar" placeholder="输入图片直链" />
          </n-form-item>
          <n-form-item label="姓名" path="name">
            <n-input v-model:value="formValue.name" placeholder="输入姓名" />
          </n-form-item>
          <n-form-item label="学号（可选）" path="number">
            <n-input v-model:value="formValue.number" placeholder="输入学号" />
          </n-form-item>
          <n-form-item label="性别（可选）" path="sex">
            <n-radio-group v-model:value="formValue.genderCode">
              <n-space>
                <n-radio v-for="sex in sexes" :key="sex.value" :value="sex.value">
                  {{ sex.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-form-item>
          <!--          <n-space vertical>-->
          <!--            <n-space>-->
          <!--              <p>分组（可选）</p>-->
          <!--              <n-button tertiary size="tiny">分组管理</n-button>-->
          <!--            </n-space>-->
          <!--            <n-transfer ref="transfer" v-model:value="formValue.groups" :options="createOptions(groups)" />-->
          <!--          </n-space>-->
        </n-form>
      </n-scrollbar>
      <div class="flex justify-end">
        <n-button :disabled="formValue.name.length === 0" type="primary" @click="handler"
          >保存
        </n-button>
      </div>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showMultiAddModal" :mask-closable="false">
    <n-card
      :bordered="true"
      closable
      size="huge"
      style="width: 50%"
      title="批量增加人员"
      @close="
        () => {
          showMultiAddModal = false
        }
      "
    >
      <n-form :label-width="80" :model="multiAddForm">
        <n-form-item label="请在下方输入姓名，多个请以空格或英文逗号分割" path="input">
          <div class="flex flex-col w-full">
            <n-text>当前已检测到：{{ multiAddForm.names.length }}个</n-text>
            <n-input
              v-model:value="multiAddForm.input"
              placeholder="张三,李四,王五……"
              type="textarea"
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
            :disabled="multiAddForm.names.length === 0"
            class="ml-auto"
            type="primary"
            @click="addPerson"
          >
            保存
          </NButton>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showImportModal" :mask-closable="false">
    <n-card
      :bordered="true"
      closable
      size="huge"
      style="width: 50%"
      title="导入人员"
      @close="showImportModal = false"
    >
      <n-upload
        :default-upload="false"
        :max="1"
        :on-before-upload="
          (fileInfo) => {
            parseExcel(fileInfo)
          }
        "
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        action=""
        directory-dnd
        multiple
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon :depth="3" size="48">
              <file-icon />
            </n-icon>
          </div>
          <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来导入人员</n-text>
        </n-upload-dragger>
      </n-upload>
      <n-space justify="center">
        <!--        <a download="人员导入模板.xlsx" :href="personXlsx" target="_blank">点此获取模板</a>-->
        <n-button text @click="downloadTemplate">点此获取模板</n-button>
      </n-space>
      <template #footer>
        <div class="flex">
          <NButton
            :disabled="multiAddForm.names.length === 0"
            class="ml-auto"
            type="primary"
            @click="addPerson"
          >
            保存
          </NButton>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped></style>
