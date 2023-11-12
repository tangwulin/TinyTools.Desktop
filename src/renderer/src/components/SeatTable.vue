<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue'
import draggable from 'vuedraggable-swap'
import { Seat, SeatState } from '../types/seat'

const key = ref(0)

const props = defineProps({
  seats: {
    type: Array as PropType<Seat[]>,
    required: true
  },
  seatMap: {
    type: Array as PropType<SeatState[]>,
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
  () => props.seatMap,
  () => (seatMap.value = props.seatMap)
)

watch(
  () => props.seats,
  () => (seats.value = props.seats)
)

const emit = defineEmits(['update:seats', 'update:seatMap', 'dragend'])

const seatMap = ref(props.seatMap)
const seats = ref(props.seats)
const reverse = ref(props.reverse)
const disable = ref(props.disable)

const parseRenderingDataToSeatMap = (x: RenderingItem[]) => {
  const newSeatMap: ('seat' | 'blank' | 'empty')[] = []
  for (const item of x) {
    switch (item.type) {
      case 'seat':
        newSeatMap.push('seat')
        break
      case 'blank':
        newSeatMap.push('blank')
        break
      case 'empty':
        newSeatMap.push('empty')
        break
    }
  }
  key.value = Math.random()
  return newSeatMap.map((item, index) => new SeatState(index, item))
}

const parseRenderingDataToSeats = (x: RenderingItem[]) => {
  const newSeats: Seat[] = []
  for (const item of x) {
    switch (item.type) {
      case 'seat':
        newSeats.push(item.data as Seat)
        break
    }
  }
  // return newSeats.map((item, index) => {
  //   return { ...item, index: index }
  // })
  return newSeats.map((item, index) => new Seat(item.owner, index))
}

class RenderingItem {
  type: 'seat' | 'blank' | 'empty'
  data?: Seat

  constructor(type: 'seat' | 'blank' | 'empty' = 'blank', data?: Seat) {
    this.type = type
    this.data = data
  }
}

const renderingData = computed({
  get() {
    const data: RenderingItem[] = []
    let i = 0
    for (const item of seatMap.value) {
      switch (item.state) {
        case 'seat':
          // data.push({ type: 'seat', ...seats.value[i], displayName: seats.value[i].displayName })
          data.push(new RenderingItem('seat', seats.value[i]))
          i++
          break
        case 'blank':
          // data.push({ type: 'blank' })
          data.push(new RenderingItem('blank'))
          break
        case 'empty':
          // data.push({ type: 'empty' })
          data.push(new RenderingItem('empty'))
          break
      }
    }
    return reverse.value ? data.reverse() : data
  },
  set(value) {
    value = reverse.value ? value.reverse() : value
    seatMap.value = parseRenderingDataToSeatMap(value)
    seats.value = parseRenderingDataToSeats(value)
    emit('update:seatMap', seatMap.value)
    emit('update:seats', seats.value)
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
</script>

<template>
  <div style="width: calc(clamp(3rem, 5vw, 6rem) * 5 / 3 * 11)">
    <div class="flex items-center justify-center mb-4">
      <div class="cell">
        <span style="margin: auto; font-size: clamp(1.25rem, 1.8vw, 4rem)">讲台</span>
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
          <span style="margin: auto; font-size: clamp(1.25rem, 1.8vw, 4rem)">
            {{ element.data.displayName ?? element.data.owner.name }}
          </span>
        </div>
        <div v-else-if="element.type === 'blank'" class="cell blank should-not-be-dragged"></div>
        <div
          v-else-if="element.type === 'empty'"
          class="cell should-not-be-dragged border-dashed"
        ></div>
      </template>
    </draggable>
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
  height: clamp(3rem, 5vw, 6rem);
  aspect-ratio: 5/3;
  border: 1px solid rgb(224, 224, 230);
  border-radius: calc(clamp(3px, 0.5vw, 10px));
}
</style>
