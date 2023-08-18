<script setup>
import { ref } from 'vue'
import { NButton, NCard, NDynamicTags, NForm, NFormItem, NInput, NModal, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { usePersonStore } from '@/stores/person'
import { useSeatStore } from '@/stores/seat'
import { getRenderingList } from '@/assets/script/seatHelper'

const props = defineProps(['showAddModal'])
const emit = defineEmits(['update:showAddModal'])

const personStore = usePersonStore()
const seatStore = useSeatStore()
const { allPerson } = storeToRefs(personStore)
const { allSeats, oldRenderingList } = storeToRefs(seatStore)

const showAddModal = ref(!!props.showAddModal || false)
if (showAddModal.value)
{
  showAddModal.value = false
  setTimeout(() => {showAddModal.value = true}, 100)
}
const formValue = ref({ input: '', names: [] })

const message = useMessage()

const parseName = () => {
  formValue.value.names =
      formValue.value.input
               .split(/[,\s]+/)
               .filter((element) => element !== undefined && element !== null && element !== '')
}

const addPerson = () => {
  console.log('添加了这' + formValue.value.names.length + '个人：' + formValue.value.names)
  allPerson.value.push(...formValue.value.names)
  message.success('添加成功，共添加了' + formValue.value.names.length + '个')
  showAddModal.value = false
  //console.log(allSeats)
  formValue.value.names
           .map((name, index) => {
             return { name: name, index: index, isSeat: true, isDashed: false }
           })
           .forEach(item => allSeats.value.push(item))
  oldRenderingList.value = getRenderingList(allSeats.value, [])
  formValue.value.names = []
  formValue.value.input = ''
  //reloadSeatTable()
}
</script>

<template>
  <div>
    <n-space justify="space-between">
      <p>修改后请重启程序以重新生成座位</p>
      <n-button type="success" @click="showAddModal=true">批量添加</n-button>
    </n-space>
    <n-dynamic-tags v-model:value="allPerson" @update:value="message.success('修改成功')"/>

    <n-modal v-model:show="showAddModal" :mask-closable="false">
      <n-card
          style="width: 50%"
          title="批量增加人员"
          :bordered="true"
          size="huge"
          closable
          @close="() => {
            showAddModal=false
            emit('update:showAddModal',false)
          }"
      >
        <n-form
            :label-width="80"
            :model="formValue"
        >
          <n-form-item label="请在下方输入姓名，多个请以空格或英文逗号分割" path="input">
            <div class="flex flex-col w-full">
              <n-text>当前已检测到：{{ formValue.names.length }}个</n-text>
              <n-input v-model:value="formValue.input" type="textarea" placeholder="张三,李四,王五……"
                       @blur="parseName" @focus="parseName" @keyup="parseName"/>
            </div>
          </n-form-item>
          <n-form-item label="解析到的姓名" path="names">
            <n-dynamic-tags v-model:value="formValue.names"/>
          </n-form-item>
        </n-form>
        <template #footer>
          <div class="flex">
            <NButton class="ml-auto" type="primary" @click="addPerson" :disabled="formValue.names.length===0">
              保存
            </NButton>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>

</style>