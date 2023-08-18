<script setup>
import { storeToRefs } from 'pinia'
import { useSeatStore } from '@/stores/seat'
import { remove } from 'lodash-es'
import { NButton, useMessage } from 'naive-ui'
import SeatTable from '@/components/SeatTable.vue'
import { computed, ref, watch } from 'vue'

const seat = useSeatStore()
const { history, allSeats, oldRenderingList } = storeToRefs(seat)

const props = defineProps(['isPreview', 'temp'])
const emit = defineEmits(['update', 'update:isPreview', 'update:temp'])

const _temp = ref(props.temp)
const temp = computed({
  get()
  {
    return _temp
  },
  set(value)
  {
    _temp.value = { ...value }
    emit('update:temp', value)
  }
})

const _isPreview = ref(props.isPreview)
const isPreview = computed({
  get()
  {
    return _isPreview.value
  },
  set(value)
  {
    _isPreview.value = value
    emit('update:isPreview', value)
  }
})

watch(() => props.isPreview, () => {
  if (!props.isPreview)
  {
    isPreview.value = false
  }
})

const message = useMessage()

const previewHandler = (x) => {
  if (!isPreview.value)
  {
    isPreview.value = true
    temp.value = {
      allSeats: [...allSeats.value],
      oldRenderingList: [...oldRenderingList.value]
    }
  }
  history.value = history.value.map(item => {
    if (item.time === x.time)
      return { ...item, isShowing: true }
    else
      return { ...item, isShowing: false }
  })
  allSeats.value = x.allSeats
  oldRenderingList.value = x.oldRenderingList
}
const rollbackHandler = (x) => {
  history.value = history.value.map(item => {
    return {
      ...item,
      isCurrent: false,
      isShowing:false
    }
  }).map(item => {
    if (item.time === x.time)
      return { ...item, isCurrent: true }
    else
      return item
  })
  if (isPreview.value)
  {
    temp.value = {
      allSeats: [...x.allSeats],
      oldRenderingList: [...x.oldRenderingList]
    }
    isPreview.value = false
  }
  allSeats.value = x.allSeats
  oldRenderingList.value = x.oldRenderingList

  message.info('已回滚到' + new Date(x.time).toLocaleString())
}
const delHandler = (x) => {
  remove(history.value, (item) => {
    return item.time === x.time
  })
  message.success('删除成功')
}
</script>

<template>
  <n-list>
    <n-scrollbar style="max-height: 100%">
      <n-list-item v-for="item in history">
        <n-popover trigger="hover" placement="left" id="popover" style="width: 42.5vw;height: 34vh">
          <template #trigger>
            <div class="flex flex-col">
              <n-button text @click="previewHandler(item)">{{ new Date(item.time).toLocaleString() }}</n-button>
              <n-space justify="center">
                <n-tag v-if="item.isShowing" :bordered="false" type="warning">当前展示</n-tag>
                <n-tag v-else-if="item.isCurrent" :bordered="false" type="success">实际座位</n-tag>
                <n-tag :bordered="false" type="info">{{ item.type }}</n-tag>
              </n-space>
            </div>
          </template>

          <div id="preview" class="flex flex-col items-center justify-center">
            <n-button :size='"large"'>讲台</n-button>
            <SeatTable :seats="item.allSeats" :rendering-list="item.oldRenderingList" :disable="true"/>
          </div>
        </n-popover>
        <template #suffix>
          <n-popconfirm
              @positive-click="rollbackHandler(item)"
              :positive-text="'确认'"
              :negative-text="'取消'"
          >
            <template #trigger>
              <n-button type="warning">回滚到此处</n-button>
            </template>
            确定要回滚到此处吗？
          </n-popconfirm>
          <n-popconfirm
              @positive-click="delHandler(item)"
              :positive-text="'确认'"
              :negative-text="'取消'"
          >
            <template #trigger>
              <n-button type="error">删除该记录</n-button>
            </template>
            确定要删除该记录吗？
          </n-popconfirm>
        </template>
      </n-list-item>
    </n-scrollbar>
  </n-list>
</template>

<style scoped>

#popover {
  width: 50vw;
  height: 15vh
}

#preview {
  width: 48vw;
  height: 40vh;
  transform-origin: top left;
  transform: scale(0.85);
}

@media (max-width: 1080px) {
  #popover {
    width: 53vw;
    height: 32vh
  }
}

@media (max-width: 1080px) {
  #preview {
    width: 80vw;
    height: 60vh;
    transform-origin: top left;
    transform: scale(0.5);
  }
}
</style>