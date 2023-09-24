<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import { Seat } from '../types/seat'
import draggable from 'vuedraggable-swap'

const props = defineProps({
  seats: {
    type: Array as PropType<Seat[]>,
    required: true
  },
  seatMap: {
    type: Array as PropType<('seat' | 'blank' | 'empty')[]>,
    required: true
  }
})

const emit = defineEmits(['update:seats', 'update:seatMap'])

const seatMap = ref(props.seatMap)
const seats = ref(props.seats)

const parseRenderingDataToSeatMap = (x: any[]) => {
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
  return newSeatMap
}

const parseRenderingDataToSeats = (x: any[]) => {
  const newSeats: Seat[] = []
  for (const item of x) {
    switch (item.type) {
      case 'seat':
        newSeats.push(item)
        break
    }
  }
  return newSeats
}

const renderingData = computed({
  get() {
    const data: any[] = []
    let i = 0
    for (const item of seatMap.value) {
      switch (item) {
        case 'seat':
          data.push({ type: 'seat', ...seats.value[i] })
          i++
          break
        case 'blank':
          data.push({ type: 'blank' })
          break
        case 'empty':
          data.push({ type: 'empty' })
          break
      }
    }
    return data
  },
  set(value) {
    seatMap.value = parseRenderingDataToSeatMap(value)
    seats.value = parseRenderingDataToSeats(value)
    emit('update:seatMap', seatMap.value)
    emit('update:seats', seats.value)
  }
})

const onMove = (e) => {
  console.log(e)
  // if (!e.relatedContext.element.type === 'seat') {
  //   return false
  // }
  return false
}
</script>

<template>
  <div>
    <draggable
      v-model="renderingData"
      :swap="true"
      class="text-center grid grid-cols-11"
      filter=".should-not-be-dragged"
      :move="onMove"
      item-key="id"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #item="{ element }">
        <div v-if="element.type === 'seat'" class="cell">{{ element.displayName }}</div>
        <div v-else-if="element.type === 'blank'" class="cell should-not-be-dragged"></div>
        <div v-else-if="element.type === 'empty'" class="cell should-not-be-dragged"></div>
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.cell.should-not-be-dragged {
  border: 1px solid black;
  pointer-events: none;
}

.cell {
  width: 9.9%;
  border: 1px dashed black;
}
</style>
