<script lang="ts" setup>
import { ClipboardPaste24Regular as PasteIcon } from '@vicons/fluent'
import { asyncComputed } from '@vueuse/core'
import deepcopy from 'deepcopy'
import { NButton, NFormItem, NInput, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddGroup from '../../components/AddGroup.vue'
import GroupItem from '../../components/GroupItem.vue'
import { AppDatabase } from '../../db'
import { deleteGroup, getDynamicGroupList } from '../../services/DBServices/Group'
import { getDynamicPersonList } from '../../services/DBServices/Person'
import { useSettingStore } from '../../stores/setting'
import { Group } from '../../types/group'
import { Person } from '../../types/person'
import { getAvatar } from '../../utils/avatarUtil'

const db = AppDatabase.getInstance()

const route = useRoute()
const router = useRouter()

const groups = getDynamicGroupList()
const persons = getDynamicPersonList()

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
    value1.value = currentGroup.value.memberIds
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
  deleteGroup(currentGroup.value.id as number)
    .then(() => {
      showModal.value = false
      currentGroup.value = new Group('', '', '')
      value1.value = []
      message.success('删除成功')
    })
    .catch((e) => {
      message.error('操作失败')
      message.error(JSON.stringify(e))
    })
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
  const person = persons.value.filter((p) => item.memberIds.includes(p.id as number))
  return person.map((p) => ({ name: p.name, src: getAvatar(p) }))
}

watch(
  value1,
  async () => {
    currentGroup.value.memberIds = value1.value
  },
  { deep: true }
)

const pasteAvatarLink = async () => {
  currentGroup.value.avatar = await navigator.clipboard.readText()
}
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
                <n-input v-model:value="currentGroup.avatar" placeholder="输入图片直链">
                  <template #suffix>
                    <n-icon
                      :component="PasteIcon"
                      style="cursor: pointer"
                      @click="pasteAvatarLink"
                    />
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item label="描述（可选）" path="number">
                <n-input v-model:value="currentGroup.description" placeholder="输入描述" />
              </n-form-item>
            </n-form>
          </div>
          <div class="flex flex-col mb-4">
            <p>当前选择了{{ currentGroup.memberIds.length }}个人</p>
            <n-space>
              <n-tag
                v-for="item in currentGroup.memberIds"
                :key="item"
                closable
                size="large"
                @close="handleRemove(persons.find((p) => p.id === item) as Person)"
              >
                <!--此处实际上并没有问题-->
                <!--                {{ persons.find((p) => p.uniqueId === item.uniqueId)?.name }}-->
                {{ (persons.find((p) => p.id === item) as Person).name }}
                <template #avatar>
                  <n-avatar
                    :img-props="{ referrerpolicy: 'no-referrer' }"
                    :src="getAvatar(persons.find((p) => p.id === item) as Person)"
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
                :disabled="!(currentGroup.name.length !== 0 && currentGroup.memberIds.length !== 0)"
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
        <group-item
          v-for="item in groups"
          :key="item.id"
          :group="item"
          :avatar="getAvatar(item)"
          :members-avatar="createAvatars(item)"
          :enable-avatar="enableAvatar"
          @click="clickHandler(item)"
        />

        <AddGroup @click="clickHandler()" />
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped></style>
