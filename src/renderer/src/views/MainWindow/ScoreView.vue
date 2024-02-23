<script lang="ts" setup>
import { ArrowUndo24Filled as UndoIcon } from '@vicons/fluent'
import {
  GroupFilled as GroupIcon,
  PersonFilled as PersonIcon,
  ScoreboardOutlined as ScoreIcon
} from '@vicons/material'
import { ReportAnalytics as ReportIcon } from '@vicons/tabler'
import { useElementSize } from '@vueuse/core/index'
import deepcopy from 'deepcopy'
import { DataTableColumns, NButton, NCard, NForm, NModal, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, h, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AddGroup from '../../components/AddGroup.vue'
import EntityItem from '../../components/EntityItem.vue'
import GroupItem from '../../components/GroupItem.vue'
import db from '../../db'
import { getDynamicGroupList } from '../../services/DBServices/Group'
import { getDynamicPersonList } from '../../services/DBServices/Person'
import { addRate, getDynamicRateList, updateRate } from '../../services/DBServices/Rate'
import { getDynamicRateHistoriesList } from '../../services/DBServices/RateHistories'
import { useGeneralStore } from '../../stores/general'
import { useSettingStore } from '../../stores/setting'
import { Group } from '../../types/group'
import { Person } from '../../types/person'
import { Rate } from '../../types/rate'
import { getAvatar } from '../../services/AvatarService'

import { remToPx } from '../../utils/styleUtil'
import RateItem from '../../components/ScoreView/RateItem.vue'

const route = useRoute()

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)
const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

const persons = getDynamicPersonList()

const groups = getDynamicGroupList()

const rates = getDynamicRateList()

const scoreHistories = getDynamicRateHistoriesList()

const showModal = ref(false)
const current = ref<Person | Group | null>(null)

const showPerson = ref(false)
showPerson.value = route.query.type === 'person'

const firstHistoryTime = computed(() => scoreHistories.value?.at(-1)?.timestamp ?? 0)
const enableUndo = computed(() => Date.now() - firstHistoryTime.value < 3 * 60 * 1000)

const message = useMessage()

const showManageModal = ref(false)
const showEditModal = ref(false)

const formData = ref(new Rate('', 0, ''))
const isEdit = ref(false)

const el = ref(null)
const { height } = useElementSize(el)
const tableHeight = computed(() => height.value - remToPx(10))

const handler = () => {
  if (!isEdit.value) {
    // db.rates.add({ ...formData.value, id: undefined })
    addRate(formData.value)
  } else {
    // db.rates.update(formData.value.id as number, formData.value)
    updateRate(formData.value.id as number, formData.value)
  }
  message.success(`${isEdit ? '编辑成功' : '添加成功'}`)
  showEditModal.value = false
}

const clickHandler = (item: Person | Group) => {
  showModal.value = true
  current.value = item
}

const scoreHandler = (rate: Rate) => {
  if (!current.value) return
  const ownerType = 'members' in current.value ? 'group' : 'person'
  switch (ownerType) {
    case 'group':
      current.value.score += rate.score
      db.groups.update(current.value.id as number, deepcopy(current.value))
      break
    case 'person':
      current.value.score += rate.score
      db.persons.update(current.value.id as number, deepcopy(current.value))
      break
    default:
      message.error('出错了，请检查类型是否正确')
      break
  }

  db.rateHistories.add({
    description: rate.name,
    timestamp: Date.now(),
    ownerId: current.value.id as number,
    ownerType,
    score: rate.score
  })

  showModal.value = false
  message.success('操作成功')
}

function undoHandler() {
  // const x = { ...scoreHistories.value[scoreHistories.value?.length - 1] }
  const x = scoreHistories.value?.at(-1)
  // scoreHistories.value = scoreHistories.value.filter((item) => item.time !== x.time)
  db.rateHistories.delete(x?.timestamp as number)
  switch (x?.ownerType) {
    case 'group': {
      const group = groups.value.find((item) => item.id === x.ownerId) as Group
      group.score -= x.score
      db.groups.update(group.id as number, group)
      break
    }
    case 'person': {
      const person = persons.value.find((item) => item.id === x.ownerId) as Person
      person.score -= x.score
      db.persons.update(person.id as number, person)
      break
    }
    default:
      message.error('出错了，请检查类型是否正确')
      break
  }
  message.success('操作成功')
}

const createAvatars = (item: Group) => {
  const members = persons.value.filter((p) => item.memberIds.includes(p.id as number))
  return members.map((p) => ({ name: p.name, src: getAvatar(p) }))
}

const createColumns = (
  del: (rate: Rate) => void,
  edit: (rate: Rate) => void
): DataTableColumns<Rate> => {
  return [
    {
      title: '名称',
      key: 'name'
    },
    {
      title: '分数',
      key: 'score'
    },
    {
      title: '描述',
      key: 'description'
    },
    {
      title: '操作',
      key: 'actions',
      width: remToPx(7.5),
      render(row) {
        return h('div', { class: 'flex items-center justify-between' }, [
          h(
            NButton,
            {
              type: 'info',
              size: 'small',
              onClick: () => edit(row)
            },
            {
              default: () => '编辑'
            }
          ),
          h(
            NButton,
            {
              type: 'error',
              size: 'small',
              onClick: () => del(row)
            },
            {
              default: () => '删除'
            }
          )
        ])
      }
    }
  ]
}

const columns = createColumns(
  (rate) => {
    db.rates.delete(rate.id as number)
    message.success('删除成功')
  },
  (rate) => {
    formData.value = rate
    isEdit.value = true
    showEditModal.value = true
  }
)
const onCloseModal = () => {
  formData.value = new Rate('', 0, '')
  isEdit.value = false
}

watch(
  () => route.query,
  () => {
    showPerson.value = route.query.type === 'person'
    if (route.query?.type) lastScoreType.value = <string>route.query.type
  }
)
</script>

<template>
  <n-modal :on-after-leave="onCloseModal" :show="showEditModal">
    <n-card
      :bordered="true"
      :title="isEdit ? '编辑' : '添加'"
      closable
      size="small"
      style="width: 50%"
      @close="showEditModal = false"
    >
      <n-form :label-width="80" :model="formData">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formData.name" placeholder="" />
        </n-form-item>
        <n-form-item label="分数" path="score">
          <n-input-number v-model:value="formData.score" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="formData.description" placeholder="" />
        </n-form-item>
      </n-form>
      <div class="flex justify-end">
        <n-button :disabled="formData.name.length === 0" type="primary" @click="handler"
          >保存
        </n-button>
      </div>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showModal">
    <n-card
      :bordered="false"
      :title="'向 ' + current?.name + ' 发送点评'"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 70%"
      @close="showModal = false"
    >
      <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: 1rem auto auto">
        <RateItem v-for="item in rates" @click="scoreHandler(item)" :rate="item" />
      </div>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showManageModal">
    <n-card
      :bordered="false"
      aria-modal="true"
      closable
      role="dialog"
      size="huge"
      style="width: 70%"
      title="评分项管理"
      @close="showManageModal = false"
    >
      <template #header-extra>
        <n-button size="small" type="primary" @click="showEditModal = true">添加</n-button>
      </template>
      <div>
        <n-data-table
          :bordered="false"
          :columns="columns"
          :data="rates"
          :max-height="tableHeight"
          :pagination="false"
        />
      </div>
    </n-card>
  </n-modal>

  <n-layout ref="el" style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 4rem)">
      <n-scrollbar v-if="showPerson">
        <div
          style="display: flex; flex-wrap: wrap; justify-content: center; margin: 1rem auto auto"
        >
          <EntityItem
            v-for="item in persons"
            :display-name="item.name"
            @click="clickHandler(item)"
            :avatar="getAvatar(item)"
            :enable-avatar="enableAvatar"
          >
            <template v-slot:footer>
              <n-tag :type="item?.score >= 0 ? 'info' : 'error'" size="small"
                >{{ item?.score ?? 0 }}
              </n-tag>
            </template>
          </EntityItem>
        </div>
      </n-scrollbar>

      <n-scrollbar v-else>
        <div
          style="display: flex; flex-wrap: wrap; justify-content: center; margin: 1rem auto auto"
        >
          <GroupItem
            v-for="item in groups"
            @click="clickHandler(item)"
            :group="item"
            :members-avatar="createAvatars(item)"
            :enable-avatar="enableAvatar"
            :avatar="getAvatar(item)"
          />

          <add-group
            @click="$router.push({ name: 'groupManage', query: { showAddModal: 'true' } })"
          />
        </div>
      </n-scrollbar>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div class="flex flex-row justify-around items-center" style="height: 4rem">
        <n-space justify="space-between" style="width: 100%">
          <div class="flex">
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="$router.push({ name: 'score', query: { type: 'group' } })"
            >
              <n-icon size="1.5rem">
                <group-icon />
              </n-icon>
              分组
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="$router.push({ name: 'score', query: { type: 'person' } })"
            >
              <n-icon size="1.5rem">
                <PersonIcon />
              </n-icon>
              个人
            </div>
          </div>
          <div class="flex">
            <div
              v-show="enableUndo"
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="undoHandler"
            >
              <n-icon :depth="enableUndo ? 1 : 3" size="1.5rem">
                <undo-icon />
              </n-icon>
              <n-p :depth="enableUndo ? 1 : 3" class="mt-0">撤销</n-p>
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="showManageModal = true"
            >
              <n-icon size="1.5rem">
                <score-icon />
              </n-icon>
              评分项
            </div>
            <div
              class="flex flex-col justify-center items-center cursor-pointer w-12"
              @click="$router.push({ name: 'scoreReport' })"
            >
              <n-icon size="1.5rem">
                <report-icon />
              </n-icon>
              报告
            </div>
          </div>
        </n-space>
      </div>
    </n-layout-footer>
  </n-layout>
</template>

<style scoped></style>
