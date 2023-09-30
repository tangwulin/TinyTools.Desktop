<script setup lang="ts">
import { useSeatStore } from '../../stores/seat'
import { usePersonStore } from '../../stores/person'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import SeatTable from '../../components/SeatTable.vue'
import { Seat } from '../../types/seat'

const personStore = usePersonStore()
const { persons } = storeToRefs(personStore)
const p = persons.value //此处为了提前加载persons，防止state为空

const seatStore = useSeatStore()
const { seatMap, seats } = storeToRefs(seatStore)

const currentDate = ref('')
const currentTime = ref('')

let updateDateTimeInterval: any

// 在组件挂载时开始更新日期和时间
onMounted(() => {
  updateDateTime()
  updateDateTimeInterval = setInterval(updateDateTime, 1000)
  const player = document.getElementById('player')
  if (player) {
    player.volume = 0.6 //关 音 菩 萨
  }
})

// 在组件卸载时停止更新日期和时间
onUnmounted(() => {
  clearInterval(updateDateTimeInterval)
})

// 更新日期和时间
function updateDateTime() {
  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()
  currentDate.value = date
  currentTime.value = time
}

const showHasDiffModal = ref(false)

const genSeatMap = (seatCount: number) => {
  const result: any[] = []
  for (let i = 0; i < seatCount; i++) {
    result.push('seat')
    if ((i + 1) % 2 === 0 && (i + 1) % 8 !== 0) result.push('blank')
  }

  if (result.length % 11 !== 0) {
    switch ((11 - (result.length % 11)) % 3) {
      case 1:
        result.push('empty')
        break
      case 2:
        result.push('empty')
        result.push('empty')
        break
    }

    if (result.length % 11 !== 0)
      for (let i = 0; i < Math.floor((11 - (result.length % 11)) / 3); i++) {
        result.push('blank')
        result.push('empty')
        result.push('empty')
      }
  }
  return result
}

console.log({ persons: persons.value, seats: seats.value, seatMap: seatMap.value })

if (persons.value.length !== seats.value.length) {
  console.log(persons.value.length, seats.value.length)
  console.log('人数和座位数不一致')
  if (seats.value.length === 0) {
    seats.value = persons.value.map((item, index) => new Seat(item, index))
    seatMap.value = genSeatMap(seats.value.length)
  } else {
    setTimeout(() => {
      showHasDiffModal.value = true
    }, 100)
  }
}
</script>

<template>
  <div
    id="SeatView"
    class="flex items-center justify-center flex-col h-auto m-auto"
    style="height: 100%"
  >
    <div id="target-div" style="margin: 0 auto">
      <div>
        <SeatTable v-model:seat-map="seatMap" v-model:seats="seats" />
      </div>
      <div class="flex justify-center mt-4" style="font-size: 1rem">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>
    <div class="fixed bottom-0 right-0 mb-2 mr-2">
      <audio
        id="player"
        controls
        style="width: 20rem"
        src="https://music.163.com/song/media/outer/url?id=430620198.mp3"
      ></audio>
    </div>
    <n-modal v-model:show="showHasDiffModal">
      <n-card style="width: 60vw" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <div class="flex flex-col items-center justify-center">
          <p>人数和座位数不一致</p>
          <p>是否重新分配座位？</p>
          <div class="flex items-center justify-center mt-4">
            <n-button size="small" type="primary" @click="showHasDiffModal = false"> 是</n-button>
            <n-button size="small" type="error" @click="showHasDiffModal = false"> 否</n-button>
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped></style>
