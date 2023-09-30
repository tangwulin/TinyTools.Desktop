<script lang="ts" setup>
import { useGroupStore } from '../../stores/group'
import { usePersonStore } from '../../stores/person'
import { useSettingStore } from '../../stores/setting'
import { storeToRefs } from 'pinia'
import remToPx from '../../utils/remToPx'
import { getAvatar } from '../../utils/avatarUtil'
import { ref, watch } from 'vue'
import { NButton, NFormItem, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useScoreStore } from '../../stores/score'
import { Group } from '../../types/group'
import { Person } from '../../types/person'

const route = useRoute()
const router = useRouter()

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const personStore = usePersonStore()
const { persons } = storeToRefs(personStore)

const settingStore = useSettingStore()
const { enableAvatar } = storeToRefs(settingStore)

const scoreStore = useScoreStore()
const { scoreHistories } = storeToRefs(scoreStore)

const showModal = ref(false)
showModal.value = route.query.showAddModal === 'true'

if (showModal.value) {
  showModal.value = false
  setTimeout(() => {
    showModal.value = true
  }, 100)
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

// const currentGroup = ref({ name: '', description: '', members: [], avatar: '' })
const currentGroup = ref(new Group('', '', ''))
const isEdit = ref(false)

const selectedSex = ref([1, 2, 9])

const message = useMessage()

// function createOptions(x: Person[]) {
//   return x.map((item) => ({
//     label: item.name,
//     value: item.uniqueId,
//     disabled: false
//   }))
// }

const createOptions = (x: Person[]) =>
  x.map((item: Person) => ({
    label: item.name,
    value: item.uniqueId,
    disabled: false
  }))

const options1 = ref(createOptions(persons.value))
const value1 = ref<Person[]>([])

watch(selectedSex, () => {
  options1.value = createOptions(
    persons.value.filter((item) => selectedSex.value.includes(item.genderCode))
  )
})

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 }
] //此处参考了GB/T 2261.1-2003

const clickHandler = (group?: Group) => {
  if (group) {
    currentGroup.value = group
    value1.value = currentGroup.value.members
    isEdit.value = true
  } else {
    // currentGroup.value = { name: '', description: '', members: [], avatar: '', uniqueId: '' }
    currentGroup.value = new Group('', '', '')
    isEdit.value = false
  }
  showModal.value = true
}

const handleRemove = (item: Person) => {
  value1.value = value1.value.filter((value) => value !== item)
}
const handler = () => {
  if (isEdit.value) {
    groups.value = groups.value.map((item) => {
      if (item.uniqueId === currentGroup.value.uniqueId) {
        persons.value.forEach(
          (p) => (p.group = p.group.filter((g) => g.uniqueId !== item.uniqueId))
        )
        currentGroup.value.members.forEach((x) =>
          (persons.value.find((p) => p.uniqueId === x.uniqueId) as Person).group.push(item)
        )
        return currentGroup.value // 使用展开语法更新 title 属性
      }
      return item // 非匹配的元素保持原样
    })
    message.success('编辑成功')
  } else {
    currentGroup.value = {
      ...currentGroup.value
      // uniqueId: generateUniqueId()
    }
    // persons.value.forEach((item) => {
    //   if (!('group' in item)) item.group = []
    // })
    currentGroup.value.members.forEach((item) =>
      (persons.value.find((p) => p.uniqueId === item.uniqueId) as Person).group.push(
        currentGroup.value
      )
    )
    groups.value.push({ ...currentGroup.value })
    message.success('添加成功')
  }
  showModal.value = false
  currentGroup.value = new Group('', '', '')
  value1.value = []
  if (route.query?.showAddModal === 'true') router.push({ name: 'score', query: { type: 'group' } })
}

const deleteHandler = () => {
  groups.value = groups.value.filter((item) => item.uniqueId !== currentGroup.value.uniqueId)
  persons.value.forEach(
    (item) => (item.group = item.group.filter((x) => x.uniqueId !== currentGroup.value.uniqueId))
  )
  scoreHistories.value = scoreHistories.value.filter(
    (item) => item.ownerId !== currentGroup.value.uniqueId
  )
  showModal.value = false
  currentGroup.value = new Group('', '', '')
  message.success('删除成功')
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
  const person = persons.value.filter((p) =>
    item.members.map((item) => item.uniqueId).includes(p.uniqueId)
  )
  return person.map((p) => ({ name: p.name, src: getAvatar(p) }))
}

const createDropdownOptions = (options: Array<{ name: string; src: string }>) =>
  options.map((option) => ({
    key: option.name,
    label: option.name
  }))

watch(
  value1,
  () => {
    currentGroup.value.members = value1.value
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
                closable
                size="large"
                @close="handleRemove(item)"
              >
                <!--此处实际上并没有问题-->
                {{ persons.find((p) => p.uniqueId === item.uniqueId)?.name }}
                <template #avatar>
                  <n-avatar
                    :img-props="{ referrerpolicy: 'no-referrer' }"
                    :src="getAvatar(persons.find((p) => p.uniqueId === item.uniqueId) as Person)"
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
                  <n-checkbox v-for="sex in sexes" :label="sex.label" :value="sex.value" />
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
              <n-popconfirm v-if="isEdit" @positive-click="deleteHandler" @negative-click="">
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
