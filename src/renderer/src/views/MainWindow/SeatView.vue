<script setup lang="ts">
import { useSeatStore } from '../../stores/seat'
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
import SeatTable from '../../components/SeatTable.vue'

const seatStore = useSeatStore()
const { seatMap, seats } = storeToRefs(seatStore)

const currentDate = ref('')
const currentTime = ref('')

// 在组件挂载时开始更新日期和时间
onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  const player = document.getElementById('player')
  if (player) {
    player.volume = 0.6 //关 音 菩 萨
  }
})

// 在组件卸载时停止更新日期和时间
onUnmounted(() => {
  clearInterval(updateDateTime)
})

// 更新日期和时间
function updateDateTime() {
  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()
  currentDate.value = date
  currentTime.value = time
}
</script>

<template>
  <div
    id="SeatView"
    class="flex items-center justify-center flex-col h-auto m-auto"
    style="height: 100%"
  >
    <div id="target-div" class="md:w-fit p-4" style="margin: 0 auto">
      <div class="flex items-center justify-center mb-4">
        <n-button :size="'large'">讲台</n-button>
      </div>
      <div>
        <SeatTable v-model:seat-map="seatMap" v-model:seats="seats" />
      </div>
      <div class="flex justify-center mt-4">
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
  </div>
</template>

<style scoped></style>
