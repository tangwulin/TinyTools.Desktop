<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
import { computed, PropType, ref, watch } from 'vue'
import draggable from 'vuedraggable-swap'
import { Seat } from '../types/seat'
import { SeatTableItem } from '../types/SeatTableItem'

const key = ref(0)
const el = ref(null)

const { width } = useElementSize(el)
const widthPerSeat = computed(() => width.value / 11)

const getFontSize = (n: number) => {
  if (n < 4) return (widthPerSeat.value * 0.7) / 3
  else return (widthPerSeat.value * 0.8) / n
}

const props = defineProps({
  seatTableData: {
    type: Array as PropType<SeatTableItem[]>,
    required: true
  },
  disable: {
    type: Boolean,
    default: false
  },
  reverse: {
    type: Boolean,
    default: false
  }
})

watch(
  () => props.seatTableData,
  () => (seatTableData.value = props.seatTableData)
)

watch(
  () => props.reverse,
  () => (reverse.value = props.reverse)
)
watch(
  () => props.disable,
  () => (disable.value = props.disable)
)

const emit = defineEmits(['dragend', 'update:seatTableData'])

const seatTableData = ref(props.seatTableData)
const reverse = ref(props.reverse)
const disable = ref(props.disable)

const renderingData = computed({
  get() {
    return reverse.value ? seatTableData.value.slice().reverse() : seatTableData.value
  },
  set(value) {
    let seatIndex = 0
    value = (reverse.value ? value.slice().reverse() : value).map((item, index) => {
      item.locationIndex = index
      if (item.type === 'seat') {
        ;(item.data as Seat).locationIndex = seatIndex++
      }
      return item
    })
    seatTableData.value = value
    emit('update:seatTableData', value)
  }
})

interface dragEvent {
  relatedContext: {
    element: {
      type: string
    }
  }
}

const onMove = (e: dragEvent) => {
  switch (e.relatedContext.element.type) {
    case 'seat':
    case 'empty':
      return true
    case 'blank':
      return false
    default:
      return false
  }
}

watch(
  () => renderingData.value,
  () => {
    key.value = Math.random()
  }
)
</script>

<template>
  <div ref="el" style="width: 100%; height: 100%">
    <div v-if="!reverse" class="flex items-center justify-center mb-4">
      <div class="cell" style="width: 10%">
        <span
          :style="{
            margin: 'auto',
            fontSize: getFontSize(2) + 'px'
          }"
          >讲台</span
        >
      </div>
    </div>
    <draggable
      :key="key"
      v-model="renderingData"
      :disabled="disable"
      :move="onMove"
      :swap="true"
      class="text-center grid grid-cols-11"
      filter=".should-not-be-dragged"
      item-key="id"
      @dragend="emit('dragend', $event)"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #item="{ element }">
        <div
          v-if="element.type === 'seat'"
          :style="{ background: element.data.color }"
          class="cell cursor-move"
        >
          <span
            :style="{
              margin: 'auto',
              fontSize: getFontSize(element.data.displayName?.length ?? 3) + 'px'
            }"
          >
            {{ element.data.displayName ?? 'Error' }}
          </span>
        </div>
        <div v-else-if="element.type === 'aisle'" class="cell blank should-not-be-dragged"></div>
        <div
          v-else-if="element.type === 'empty'"
          class="cell should-not-be-dragged border-dashed"
        ></div>
      </template>
    </draggable>
    <div v-if="reverse" class="flex items-center justify-center mt-4">
      <div class="cell" style="width: 10%">
        <span
          :style="{
            margin: 'auto',
            fontSize: getFontSize(2) + 'px'
          }"
          >讲台</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.cell.should-not-be-dragged.blank {
  border: none;
  pointer-events: none;
}

.cell.border-dashed {
  border: 1px dashed rgb(224, 224, 230);
}

.cell {
  display: flex;
  width: 100%;
  aspect-ratio: 5/3;
  border: 1px solid rgb(224, 224, 230);
  border-radius: calc(clamp(3px, 8%, 10px));
}
</style>
