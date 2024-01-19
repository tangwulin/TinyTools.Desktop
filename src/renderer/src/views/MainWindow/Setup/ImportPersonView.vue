<script lang="ts" setup>
import { from, useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { useMessage } from 'naive-ui'
import { onBeforeRouteLeave } from 'vue-router'
import db from '../../../db'
import PersonManage from '../PersonManage.vue'

const message = useMessage()

const persons = useObservable(from(liveQuery(() => db.persons.toArray())))

onBeforeRouteLeave(() => {
  if (persons.value?.length === 0) {
    message.error('至少添加一个人')
    return false
  }
  return true
})
</script>

<template>
  <div class="flex justify-center items-center" style="height: 100%">
    <div style="height: 100%; overflow: hidden">
      <person-manage />
    </div>
  </div>
</template>

<style scoped></style>
