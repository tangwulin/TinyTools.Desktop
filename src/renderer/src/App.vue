<script lang="ts" setup>
import { dateZhCN, zhCN } from 'naive-ui'
// import { useGroupStore } from './stores/group'
// import { usePersonStore } from './stores/person'
// import { useSeatStore } from './stores/seat'
// import { storeToRefs } from 'pinia'

import { db } from './db'
import { onBeforeMount } from 'vue'
onBeforeMount(async () => {
  console.log('db open')
  await db.open()
})
// import { Person } from './types/person'
//
// const id = await db.persons.add(new Person(`${Date.now().toLocaleString()}`, 9, ''))
//
// console.log(id)
//
// console.log(db.persons.mapToClass(new Person()))

// const groupStore = useGroupStore()
// const personStore = usePersonStore()
// const seatStore = useSeatStore()
//
// const { groups } = storeToRefs(groupStore)
// const { persons } = storeToRefs(personStore)
// const { seats } = storeToRefs(seatStore)
//其实上面导出来的值并没有实际作用，只是为了尽早挂载pinia，否则部分字段会缺失
</script>

<template>
  <n-config-provider :date-locale="dateZhCN" :locale="zhCN">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
@font-face {
  font-family: 'HYWenHei-85W';
  src: url('./assets/fonts/HYWenHei-85W.ttf') format('truetype');
}

body {
  font-family: 'HYWenHei-85W', sans-serif;
  background: transparent;
}

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: var(--n-color);
  background-image: none;
}
</style>
