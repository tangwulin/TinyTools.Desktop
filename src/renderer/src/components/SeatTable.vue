<script setup>
import { NButton } from 'naive-ui'
import draggable from 'vuedraggable-swap'
import { computed, ref, watch } from 'vue'
import { getRenderingList, parseRenderingListToSeats } from '@/assets/script/seatHelper'

const props = defineProps(['seats', 'renderingList', 'coloringEdge', 'rendering', 'disable'])
const emit = defineEmits(['update', 'update:seats', 'update:renderingList', 'update:rendering'])

const rendering = ref(props.rendering)

rendering.value = true
emit('update:rendering', true) //通知外面正在渲染

let onPropChanging = false
let onRenderingChanging = false

const oldRenderingList = ref(props.renderingList)
const coloring = ref(props.coloringEdge)
console.log('coloring:' + coloring.value)

const _seats = ref(props.seats)
const seats = computed({
  get()
  {
    return _seats.value
  },
  set(value)
  {
    console.log('seats changed onRenderingChanging:' + onRenderingChanging)
    _seats.value = value.map((item, index) => {
      return { ...item, index: index }
    })
    onPropChanging = true
    if (onRenderingChanging)
    {
      onRenderingChanging = false
    }
    else
    {
      renderingList.value = getRenderingList(seats.value, renderingList.value, coloring.value)
    }
    emit('update:seats', value)
  }
})
//console.log(getRenderingList(seats.value, [], coloring.value))
let oldRenderingListInitialized = false
if (oldRenderingList.value.length === 0 && seats.value.length !== 0)
{
  //console.log(oldRenderingList.value)
  if (!oldRenderingListInitialized) //不要问为什么不提出来到外面那层if，问就是不行
  {
    oldRenderingList.value = getRenderingList(seats.value, [], coloring.value)
    emit('update:renderingList', oldRenderingList.value)
    console.log('oldRenderingList updated')
  }
  oldRenderingListInitialized = true
}
const _renderingList = ref(getRenderingList(seats.value, oldRenderingList.value, coloring.value))
const renderingList = computed({
  get()
  {
    console.log('get renderingList')
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    rendering.value = false //别骂哥们，因为真不知道怎么写
    emit('update:rendering', false)
    return _renderingList.value
  },
  set(value)
  {
    console.log('renderingList changed onPropChanging:' + onPropChanging)
    _renderingList.value = [...value]
    oldRenderingList.value = getRenderingList(parseRenderingListToSeats(value), value)
    if (onPropChanging)
    {
      onPropChanging = false
    }
    else
    {
      onRenderingChanging = true
      seats.value = parseRenderingListToSeats(value)
      emit('update')
    }
    emit('update:renderingList', value)
  }
})

watch(() => props.seats, () => {
  console.log('props.seats changed')
  seats.value = props.seats
})

watch(() => props.coloringEdge, () => {
  console.log('props.coloringEdge changed')
  coloring.value = props.coloringEdge
})
</script>

<template>
  <div>
    <draggable
        v-model="renderingList"
        filter=".should-not-be-dragged"
        :swap="true"
        :disabled="disable"
        class="text-center  grid grid-cols-11"
        item-key="id">
      <!--suppress VueUnrecognizedSlot -->
      <template #item="{ element }">
        <NButton v-if="element.isSeat" :color="element.color" size="large">{{ element.name }}</NButton>
        <div v-else-if="!element.isDashed" class="should-not-be-dragged"></div>
        <NButton v-else size="large" dashed :focusable="false" class="should-not-be-dragged"></NButton>
      </template>
    </draggable>
  </div>
</template>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
button, [type='button'], [type='reset'], [type='submit'] {
  -webkit-appearance: button;
  background-color: var(--n-color);
  background-image: none;
}
</style>