<script setup>
import { useGroupStore } from '../stores/group'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import { generateUniqueId, remToPx } from '../assets/script/util'
import { getAvatar } from '../utils/AvatarUtil'
import { ref, watch } from 'vue'
import { NButton, NFormItem, NInput, useMessage } from 'naive-ui'
import { useRoute } from 'vue-router'

const route = useRoute()

const groupStore = useGroupStore()
const { groups } = storeToRefs(groupStore)

const personStore = usePersonStore()
const { personList } = storeToRefs(personStore)

const showModal = ref(false)
showModal.value = route.query.showAddModal === 'true'

if (showModal.value)
{
  showModal.value = false
  setTimeout(() => {
    showModal.value = true
  }, 100)
} //虽然切换路由时会自动关闭，但是这样做可以让用户看到动画

const currentGroup = ref({ name: '', description: '', members: [], avatar: '' })
const isEdit = ref(false)

const selectedSex = ref([1, 2, 9])

const message = useMessage()

function createOptions(x)
{
  return x.map((item) => ({
    label: item.name,
    value: item.uniqueId,
    disabled: false,
  }))
}

const options1 = ref(createOptions(personList.value))
const value1 = ref([])

watch(selectedSex, () => {
  options1.value = createOptions(
    personList.value.filter((item) => selectedSex.value.includes(item.sex)),
  )
})

const sexes = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未填写', value: 9 },
] //此处参考了GB/T 2261.1-2003

const clickHandler = (group = null) => {
  if (group)
  {
    currentGroup.value = group
    console.log(currentGroup)
    value1.value = currentGroup.value.members
    isEdit.value = true
  }
  else
  {
    currentGroup.value = { name: '', description: '', members: [], avatar: '', uniqueId: '' }
    isEdit.value = false
  }
  showModal.value = true
}

const handleRemove = (item) => {
  value1.value = value1.value.filter(value => value !== item)
}
const handler = () => {
  if (isEdit.value)
  {
    groups.value = groups.value.map((item) => {
      if (item.uniqueId === currentGroup.value.uniqueId)
      {
        return currentGroup.value // 使用展开语法更新 title 属性
      }
      return item // 非匹配的元素保持原样
    })
    message.success('编辑成功')
  }
  else
  {
    groups.value.push({ ...currentGroup.value, uniqueId: generateUniqueId() })
    message.success('添加成功')
  }
  showModal.value = false
}

const deleteHandler = () => {
  groups.value = groups.value.filter(item => item.uniqueId !== currentGroup.value.uniqueId)
  showModal.value = false
  message.success('删除成功')
}

const createAvatars = (item) => {
  const person = personList.value.filter(p => item.members.includes(p.uniqueId))
  return person.map(p => ({ name: p.name, src: getAvatar(p) }))
}

const createDropdownOptions = (options) => options.map((option) => ({
  key: option.name,
  label: option.name,
}))

watch(
  value1,
  () => {
    currentGroup.value.members = value1.value
  },
  { deep: true },
)
</script>

<template>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 70%"
      :title="isEdit?'编辑':'添加'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      :mask-closable=!isEdit
      closable
      @close="()=>{
        showModal=false
        currentGroup= { name: '', description: '', members: [],avatar:'',uniqueId:'' }
        value1=[]
      }"
    >
      <n-scrollbar style="max-height: 70vh;overflow-x: hidden">
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
            <n-tag closable @close="handleRemove(item)" v-for="item in currentGroup.members" size="large">
              {{ personList.find(p => p.uniqueId === item).name }}
              <template #avatar>
                <n-avatar
                  :src="getAvatar(personList.find(p=>p.uniqueId===item))"
                />
              </template>
            </n-tag>
          </n-space>
        </div>
        <p style="font-size: 1rem;">筛选</p>
        <n-divider style="margin: 0;" />
        <n-collapse>
          <n-collapse-item name="1" title="性别">
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
          <n-collapse-item name="2" title="姓名">
            <n-transfer
              ref="transfer"
              v-model:value="value1"
              :options="options1"
              source-filterable
              class="pr-3"
            />
          </n-collapse-item>
        </n-collapse>
      </n-scrollbar>
      <template #footer>
        <div class="flex justify-end">
          <n-space>
            <n-popconfirm
              @positive-click="deleteHandler"
              @negative-click=""
              v-if="isEdit"
            >
              <template #trigger>
                <n-button type="error">删除</n-button>
              </template>
              确定要删除这个小组吗？
            </n-popconfirm>
            <n-button type="primary" @click="handler"
                      :disabled="!(currentGroup.name.length!==0&& currentGroup.members.length!==0)">保存
            </n-button>
          </n-space>
        </div>
      </template>
    </n-card>
  </n-modal>
  <n-scrollbar>
    <div
      style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:1rem auto auto;
            "
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
                  margin:0 0.5rem;
                "
        >
          <n-avatar
            :size="remToPx(3)"
            :src="getAvatar(item)"
            lazy
            object-fit="contain"
            round
          />
          <div class="mx-auto flex flex-col" style="font-size: 0.75rem;">
            <span>{{ item?.name }}</span>
            <n-space justify="space-between"><span>{{ item?.members.length }}人</span>
              <n-tag :bordered="false" size="small">{{ item.score ?? 0 }}</n-tag>
            </n-space>
            <n-avatar-group :options="createAvatars(item)" :size="remToPx(2)" :max="5">
              <template #avatar="{ option: { name, src } }">
                <n-tooltip>
                  <template #trigger>
                    <n-avatar :src="src" />
                  </template>
                  {{ name }}
                </n-tooltip>
              </template>
              <template #rest="{ options: restOptions, rest }">
                <n-dropdown :options="createDropdownOptions(restOptions)" placement="top"
                            arrow-style="overflow: hidden;" style="overflow: hidden;">
                  <n-avatar style="font-size: 0.75rem;">+{{ rest }}</n-avatar>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
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
</template>

<style scoped>

</style>