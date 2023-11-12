<script lang="ts" setup>
import { useSettingStore } from '../../stores/setting'
import { storeToRefs } from 'pinia'
import remToPx from '../../utils/remToPx'
import { getAvatar } from '../../utils/avatarUtil'
import { Ref, ref, watch } from 'vue'
import { NButton, NFormItem, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { Group } from '../../types/group'
import { Person } from '../../types/person'
import { useObservable } from '@vueuse/rxjs/index'
import { liveQuery } from 'dexie'
import { AppDatabase } from '../../db'
import { asyncComputed } from '@vueuse/core'
import { from } from '@vueuse/rxjs'
import deepcopy from 'deepcopy'

const db = AppDatabase.getInstance()

const route = useRoute()
const router = useRouter()

const groups = useObservable(from(liveQuery(() => db.groups.toArray()))) as Readonly<Ref<Group[]>>
const persons = useObservable(from(liveQuery(() => db.persons.toArray()))) as Readonly<
  Ref<Person[]>
>

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const showModal = ref(false)
showModal.value = route.query.showAddModal === 'true'

if (showModal.value) {
  showModal.value = false
  setTimeout(() => {
    showModal.value = true
  }, 100)
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

const currentGroup = ref(new Group('', '', ''))
const isEdit = ref(false)

const selectedSex = ref([1, 2, 9])

const message = useMessage()

const createOptions = (x: Person[]) => {
  if (!x) return []
  return x.map((item: Person) => ({
    label: item.name,
    value: item.id,
    disabled: false
  }))
}

const options1 = asyncComputed(
  () => createOptions(persons.value.filter((item) => selectedSex.value.includes(item.genderCode))),
  [],
  { lazy: true }
)
const value1 = ref<number[]>([])

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 }
] //此处参考了GB/T 2261.1-2003

const clickHandler = (group?: Group) => {
  if (group) {
    currentGroup.value = group
    value1.value = currentGroup.value.members.map((item) => item.id) as number[]
    isEdit.value = true
  } else {
    currentGroup.value = new Group('', '', '')
    isEdit.value = false
  }
  showModal.value = true
}

const handleRemove = (item: Person) => {
  value1.value = value1.value.filter((value) => value !== item.id)
}

const handler = () => {
  try {
    db.groups.put(deepcopy(currentGroup.value))
    message.success(isEdit.value ? '编辑成功' : '添加成功')
  } catch (e) {
    message.error('操作失败')
    message.error(JSON.stringify(e))
  }
  showModal.value = false
  currentGroup.value = new Group('', '', '')
  value1.value = []
  if (route.query?.showAddModal === 'true') router.push({ name: 'score', query: { type: 'group' } })
}

const deleteHandler = () => {
  try {
    db.groups.delete(currentGroup.value.id as number)
    //TODO: 删除小组时，应该删除小组所有的分数记录
    showModal.value = false
    currentGroup.value = new Group('', '', '')
    message.success('删除成功')
  } catch (e) {
    message.error('操作失败')
    message.error(JSON.stringify(e))
  }
}

const onModalClose = () => {
  showModal.value = false
  currentGroup.value = new Group('', '', '')
  value1.value = []
  if (route.query?.showAddModal === 'true')
    setTimeout(() => {
      router.push({ name: 'score', query: { type: 'group' } })
    }, 150)
}

const createAvatars = (item: Group) => {
  if (!persons.value) return []
  const person = persons.value.filter((p) => item.members.map((m) => m.id).includes(p.id))
  return person.map((p) => ({ name: p.name, src: getAvatar(p) }))
}

const createDropdownOptions = (
  options: Array<{
    name: string
    src: string
  }>
) =>
  options.map((option) => ({
    key: option.name,
    label: option.name
  }))

watch(
  value1,
  async () => {
    currentGroup.value.members = await db.persons
      .where('id')
      .anyOf(value1.value as number[])
      .toArray()
  },
  { deep: true }
)
</script>

<template>
  <div style="height: calc(100vh - 1rem)">
    <n-modal v-model:show="showModal" :mask-closable="false">
      <n-card
        :bordered="false"
        :title="isEdit ? '编辑' : '添加'"
        aria-modal="true"
        closable
        role="dialog"
        size="huge"
        style="width: 70%"
        @close="onModalClose"
      >
        <n-scrollbar style="max-height: 70vh; overflow-x: hidden">
          <div>
            <n-form>
              <n-form-item label="小组名称" path="name">
                <n-input v-model:value="currentGroup.name" placeholder="输入名称" />
              </n-form-item>
              <n-form-item label="小组头像（可选）" path="avatar">
                <n-input v-model:value="currentGroup.avatar" placeholder="输入图片直链" />
              </n-form-item>
              <n-form-item label="描述（可选）" path="number">
                <n-input v-model:value="currentGroup.description" placeholder="输入描述" />
              </n-form-item>
            </n-form>
          </div>
          <div class="flex flex-col mb-4">
            <p>当前选择了{{ currentGroup.members.length }}个人</p>
            <n-space>
              <n-tag
                v-for="item in currentGroup.members"
                :key="item.id"
                closable
                size="large"
                @close="handleRemove(item)"
              >
                <!--此处实际上并没有问题-->
                <!--                {{ persons.find((p) => p.uniqueId === item.uniqueId)?.name }}-->
                {{ item.name }}
                <template #avatar>
                  <n-avatar
                    :img-props="{ referrerpolicy: 'no-referrer' }"
                    :src="getAvatar(item)"
                    lazy
                    object-fit="contain"
                    round
                  />
                </template>
              </n-tag>
            </n-space>
          </div>
          <p style="font-size: 1rem">筛选</p>
          <n-divider style="margin: 0" />
          <n-collapse>
            <n-collapse-item name="1" title="性别">
              <n-checkbox-group v-model:value="selectedSex">
                <n-space item-style="display: flex;">
                  <n-checkbox
                    v-for="sex in sexes"
                    :key="sex.value"
                    :label="sex.label"
                    :value="sex.value"
                  />
                </n-space>
              </n-checkbox-group>
            </n-collapse-item>
            <n-collapse-item name="2" title="姓名">
              <n-transfer
                ref="transfer"
                v-model:value="value1"
                :options="options1"
                class="pr-3"
                source-filterable
              />
            </n-collapse-item>
          </n-collapse>
        </n-scrollbar>
        <template #footer>
          <div class="flex justify-end">
            <n-space>
              <n-popconfirm v-if="isEdit" @positive-click="deleteHandler">
                <!--suppress VueUnrecognizedSlot -->
                <template #trigger>
                  <n-button type="error">删除</n-button>
                </template>
                确定要删除这个小组吗？
              </n-popconfirm>
              <n-button
                :disabled="!(currentGroup.name.length !== 0 && currentGroup.members.length !== 0)"
                type="primary"
                @click="handler"
                >保存
              </n-button>
            </n-space>
          </div>
        </template>
      </n-card>
    </n-modal>
    <n-scrollbar>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; margin: 1rem auto auto">
        <div
          v-for="item in groups"
          :key="item.id"
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
              :img-props="{ referrerpolicy: 'no-referrer' }"
              :size="remToPx(3)"
              :src="getAvatar(item)"
              lazy
              object-fit="contain"
              round
            />
            <div class="mx-auto flex flex-col" style="font-size: 0.75rem">
              <span>{{ item?.name }}</span>
              <n-space justify="space-between"
                ><span>{{ item?.members.length }}人</span>
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
                      <n-avatar :src="src" />
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
          @click="clickHandler()"
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
  </div>
</template>

<style scoped></style>
