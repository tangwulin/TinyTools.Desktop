<script lang="ts" setup>
// import { History as HistoryIcon } from '@vicons/tabler'
import { ArrowUndo24Filled as UndoIcon } from '@vicons/fluent'
import {
  GroupFilled as GroupIcon,
  PersonFilled as PersonIcon,
  ScoreboardOutlined as ScoreIcon
} from '@vicons/material'
import { ReportAnalytics as ReportIcon } from '@vicons/tabler'
import { useElementSize } from '@vueuse/core/index'
import { from, useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { DataTableColumns, NButton, NCard, NForm, NModal, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, h, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AppDatabase } from '../../db'
import { useGeneralStore } from '../../stores/general'
import { useSettingStore } from '../../stores/setting'
import { Group } from '../../types/group'
import { Person } from '../../types/person'
import { Rate } from '../../types/rate'
import { getAvatar } from '../../utils/avatarUtil'
import remToPx from '../../utils/remToPx'

const db = AppDatabase.getInstance()

const route = useRoute()

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)
const generalStore = useGeneralStore()
const { lastScoreType } = storeToRefs(generalStore)

const loading = ref(true)

const persons = ref<Person[]>([])
const personsPromise = db.persons.toArray().then((result) => {
  persons.value = result as Person[]
})

const groups = ref<Group[]>([])
const groupsPromise = db.groups.toArray().then((result) => {
  groups.value = result as Group[]
})

const rates = useObservable(from(liveQuery(() => db.rates.toArray())))

const scoreHistories = useObservable(from(liveQuery(() => db.scoreHistories.toArray())))

Promise.all([personsPromise, groupsPromise]).then(() => {
  loading.value = false
})

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
    db.rates.add({ ...formData.value, id: undefined })
  } else {
    db.rates.update(formData.value.id as number, formData.value)
  }
  message.success(`${isEdit ? '编辑成功' : '添加成功'}`)
  showEditModal.value = false
}

const clickHandler = (item: Person | Group) => {
  showModal.value = true
  current.value = item
}

const scoreHandler = (rate) => {
  if (!current.value) return
  const ownerType = 'members' in current.value ? 'group' : 'person'
  switch (ownerType) {
    case 'group':
      current.value.score += rate.score
      db.groups.update(current.value.id as number, current.value)
      break
    case 'person':
      current.value.score += rate.score
      db.persons.update(current.value.id as number, current.value)
      break
    default:
      message.error('出错了，请检查类型是否正确')
      break
  }

  db.scoreHistories.add({
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
  db.scoreHistories.delete(x?.timestamp as number)
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

const createAvatars = (item) => {
  const members = persons.value.filter((p) => item.membersID.includes(p.id))
  return members.map((p) => ({ name: p.name, src: getAvatar(p) }))
}

const createDropdownOptions = (options) =>
  options.map((option) => ({
    key: option.name,
    label: option.name
  }))

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
        <div
          v-for="item in rates"
          style="
            width: 6rem;
            height: 6rem;
            background: #fff;
            box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
            border-radius: 1rem;
            margin: 0.5rem;
          "
          @click="scoreHandler(item)"
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
            <div class="flex flex-col items-center">
              <p style="text-align: center">{{ item?.name }}</p>
              <n-tag :type="item.score >= 0 ? 'info' : 'error'" size="small"
                >{{ item?.score ?? 0 }}
              </n-tag>
              <n-p depth="3" style="font-size: 0.75rem; margin: 0">{{ item?.description }}</n-p>
            </div>
          </div>
        </div>
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
          <div
            v-for="item in persons"
            style="
              width: 6rem;
              height: 6rem;
              background: #fff;
              box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
              border-radius: 1rem;
              margin: 0.5rem;
            "
            @click="clickHandler(item)"
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
                v-if="enableAvatar"
                :img-props="{ referrerpolicy: 'no-referrer' }"
                :size="remToPx(3)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
                style="margin: 0.5rem auto"
              />
              <div class="flex flex-row items-center">
                <p>{{ item?.name }}</p>
                <n-tag :type="item?.score >= 0 ? 'info' : 'error'" size="small"
                  >{{ item?.score ?? 0 }}
                </n-tag>
              </div>
            </div>
          </div>
        </div>
      </n-scrollbar>
      <n-scrollbar v-else>
        <div
          style="display: flex; flex-wrap: wrap; justify-content: center; margin: 1rem auto auto"
        >
          <div
            v-for="item in groups"
            style="
              width: 12rem;
              height: 6rem;
              background: #fff;
              box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
              border-radius: 1rem;
              margin: 0.5rem;
            "
            @click="clickHandler(item)"
          >
            <div
              style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                margin: 0 0.5rem;
              "
            >
              <n-avatar
                v-if="enableAvatar"
                :size="remToPx(3)"
                :src="getAvatar(item)"
                lazy
                object-fit="contain"
                round
              />
              <div class="mx-auto flex flex-col" style="font-size: 0.75rem">
                <span>{{ item?.name }}</span>
                <n-space justify="space-between"
                  ><span>{{ item?.membersID.length }}人</span>
                  <n-tag :bordered="false" size="small">{{ item.score ?? 0 }}</n-tag>
                </n-space>
                <n-avatar-group
                  v-if="enableAvatar"
                  :max="5"
                  :options="createAvatars(item)"
                  :size="remToPx(2)"
                >
                  <template #avatar="{ option: { name, src } }">
                    <n-tooltip>
                      <!--suppress VueUnrecognizedSlot -->
                      <template #trigger>
                        <n-avatar
                          :img-props="{ referrerpolicy: 'no-referrer' }"
                          :src="src"
                          lazy
                          object-fit="contain"
                          round
                        />
                      </template>
                      {{ name }}
                    </n-tooltip>
                  </template>
                  <template #rest="{ options: restOptions, rest }">
                    <n-dropdown
                      :options="createDropdownOptions(restOptions)"
                      arrow-style="overflow: hidden;"
                      placement="top"
                      style="overflow: hidden"
                    >
                      <n-avatar style="font-size: 0.75rem">+{{ rest }}</n-avatar>
                    </n-dropdown>
                  </template>
                </n-avatar-group>
              </div>
            </div>
          </div>

          <div
            style="
              width: 12rem;
              height: 6rem;
              background: #fff;
              box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
              border-radius: 1rem;
              margin: 0.5rem;
            "
            @click="$router.push({ name: 'groupManage', query: { showAddModal: 'true' } })"
          >
            <div
              style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
              "
            >
              <n-icon size="3rem">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M368.5 240H272v-96.5c0-8.8-7.2-16-16-16s-16 7.2-16 16V240h-96.5c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7H240v96.5c0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7 8.8 0 16-7.2 16-16V272h96.5c8.8 0 16-7.2 16-16s-7.2-16-16-16z"
                  />
                </svg>
              </n-icon>
              <span>添加分组</span>
            </div>
          </div>
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
