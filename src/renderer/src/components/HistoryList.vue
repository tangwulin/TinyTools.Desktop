<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { SeatHistory } from '../types/seatHistory'

const props = defineProps({
  seatHistory: {
    type: Array as PropType<SeatHistory[]>,
    required: true
  }
})

const history = computed(() => props.seatHistory.slice().reverse())

const emit = defineEmits(['rollback', 'preview', 'delete'])

const rollbackHandler = (x: SeatHistory) => {
  emit('rollback', x)
}

const previewHandler = (x: SeatHistory) => {
  emit('preview', x)
}

const delHandler = (x: SeatHistory) => {
  emit('delete', x)
}
</script>

<template>
  <n-list>
    <n-scrollbar style="max-height: 100%">
      <n-list-item v-for="item in history" :key="item.timestamp">
        <n-popover
          id="popover"
          placement="left"
          style="width: 42.5vw; height: 42vh"
          trigger="hover"
        >
          <template #trigger>
            <div class="flex flex-col">
              <n-button text @click="previewHandler(item)"
                >{{ new Date(item.timestamp).toLocaleString() }}
              </n-button>
              <n-space justify="center">
                <!--                <n-tag v-if="item.isShowing" :bordered="false" type="warning">当前展示</n-tag>-->
                <!--                <n-tag v-else-if="item.isCurrent" :bordered="false" type="success">实际座位</n-tag>-->
                <n-tag :bordered="false" type="info">{{ item.type }}</n-tag>
              </n-space>
            </div>
          </template>

          <div id="preview" class="flex flex-col items-center justify-start">
            <seat-table :disable="true" :seat-table-data="item.seatTable" />
          </div>
        </n-popover>
        <template #suffix>
          <n-button type="warning" @click="rollbackHandler(item)"> 回滚到此处</n-button>
          <n-button type="error" @click="delHandler(item)"> 删除该记录</n-button>
        </template>
      </n-list-item>
    </n-scrollbar>
  </n-list>
</template>

<style scoped></style>
