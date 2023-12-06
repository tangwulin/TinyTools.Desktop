<script lang="ts" setup>
import { File as FileIcon } from '@vicons/tabler'
import { useObservable } from '@vueuse/rxjs'
import { from } from '@vueuse/rxjs/index'
import { liveQuery } from 'dexie'
import { NText, useMessage } from 'naive-ui'
import { computed } from 'vue'
import * as XLSX from 'xlsx'
// @ts-ignore:2307
import courseXlsx from '../../../assets/xlsx/course.xlsx'

import { AppDatabase } from '../../../db'
import { CourseTableItem } from '../../../interface/course'

import downloadAnyFile from '../../../utils/downloadAnyFile'

const db = AppDatabase.getInstance()

const allCourses = useObservable(from(liveQuery(() => db.coursesTable.toArray())))

const message = useMessage()

const hasImportSuccess = computed(() => allCourses.value?.length !== 0)

const parseExcel = async (uploadFileInfo) => {
  const file = uploadFileInfo.file.file
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheetNames = workbook.SheetNames // 工作表名称集合
  const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet
  const json = XLSX.utils.sheet_to_json(worksheet)

  const coursesFromExcel = json
    .map((item: any) => {
      try {
        return {
          time: {
            start: {
              hour: parseInt(item['开始时间'].split(':')[0]),
              minute: parseInt(item['开始时间'].split(':')[1])
            },
            end: {
              hour: parseInt(item['结束时间'].split(':')[0]),
              minute: parseInt(item['结束时间'].split(':')[1])
            }
          },
          mon: item['星期一'],
          tue: item['星期二'],
          wed: item['星期三'],
          thu: item['星期四'],
          fri: item['星期五'],
          spe1: item['特别1'],
          spe2: item['特别2'],
          spe3: item['特别3'],
          spe4: item['特别4'],
          spe5: item['特别5']
        }
      } catch (e) {
        return undefined
      }
    })
    .filter((item) => item !== undefined)

  if (coursesFromExcel.length === 0) {
    message.error('未检测到有效的信息，请检查文件格式是否正确')
  } else {
    db.open()
    db.coursesTable.bulkPut(coursesFromExcel as CourseTableItem[])
    message.success('导入成功')
  }
}

const downloadTemplate = () => {
  downloadAnyFile(courseXlsx, '课程表模板.xlsx')
}

const clearHandler = () => {
  db.coursesTable.clear()
  message.success('清除成功')
}
</script>

<template>
  <div style="display: flex; justify-content: center; height: 80%">
    <n-card
      :bordered="false"
      style="margin: auto auto; display: flex; justify-content: center; align-items: center"
    >
      <n-table v-if="hasImportSuccess" :single-line="false">
        <thead>
          <tr>
            <th>时间</th>
            <th>星期一</th>
            <th>星期二</th>
            <th>星期三</th>
            <th>星期四</th>
            <th>星期五</th>
            <th>特别1</th>
            <th>特别2</th>
            <th>特别3</th>
            <th>特别4</th>
            <th>特别5</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in allCourses" :key="course.id">
            <td>
              {{ course.time.start.hour }}:{{ course.time.start.minute }} -
              {{ course.time.end.hour }}:{{ course.time.end.minute }}
            </td>
            <td>{{ course.mon }}</td>
            <td>{{ course.tue }}</td>
            <td>{{ course.wed }}</td>
            <td>{{ course.thu }}</td>
            <td>{{ course.fri }}</td>
            <td>{{ course.spe1 }}</td>
            <td>{{ course.spe2 }}</td>
            <td>{{ course.spe3 }}</td>
            <td>{{ course.spe4 }}</td>
            <td>{{ course.spe5 }}</td>
          </tr>
        </tbody>
      </n-table>
      <n-upload
        v-else
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
        style="width: 40rem"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon :depth="3" size="48">
              <file-icon />
            </n-icon>
          </div>
          <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来导入课程表</n-text>
        </n-upload-dragger>
      </n-upload>
      <n-space v-if="!hasImportSuccess" justify="center">
        <!--        <a download="课程表模板.xlsx" :href="courseXlsx" target="_blank">点此获取模板</a>-->
        <n-button text @click="downloadTemplate">点此获取模板</n-button>
      </n-space>
    </n-card>
    <n-button
      v-if="hasImportSuccess"
      style="position: absolute; top: 1rem; left: 1rem"
      type="warning"
      @click="clearHandler"
      >重新导入
    </n-button>
  </div>
</template>

<style scoped></style>
