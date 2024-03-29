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
      <n-list-item v-for="(item, index) in history" :key="item.timestamp">
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
          <n-popconfirm
            :negative-text="'取消'"
            :positive-text="'确认'"
            @positive-click="rollbackHandler(item)"
          >
            <template #trigger>
              <n-button :disabled="index === 0" type="warning"> 回滚到此处</n-button>
            </template>
            确定要回滚到此处吗？
          </n-popconfirm>
          <n-popconfirm
            :negative-text="'取消'"
            :positive-text="'确认'"
            @positive-click="delHandler(item)"
          >
            <template #trigger>
              <n-button :disabled="index === 0" type="error"> 删除该记录</n-button>
            </template>
            确定要删除该记录吗？
          </n-popconfirm>
        </template>
      </n-list-item>
    </n-scrollbar>
  </n-list>
</template>

<style scoped></style>
