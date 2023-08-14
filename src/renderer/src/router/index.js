import { createRouter, createWebHistory } from 'vue-router'
import SeatView from '../views/SeatView.vue'

// const key = 'isBooting'
// const value = sessionStorage.getItem(key)
//
// if (value === null || value === undefined) {
//   // key 在 sessionStorage 中不存在或者值为 null/undefined
//   sessionStorage.setItem(key, 'true')
// }
// let isBooting = JSON.parse(sessionStorage.getItem(key))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: SeatView
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TransparentView.vue')
    }
  ]
})

// const openMainWindow = async () => {
//   isBooting = false
//   sessionStorage.setItem(key, 'false')
//   try {
//     const splashscreen = WebviewWindow.getByLabel('splashscreen')
//     if (splashscreen !== null) {
//       await splashscreen.close()
//       console.log('splashscreen关闭成功')
//     }
//   } catch (e) {
//     sessionStorage.setItem('error', JSON.stringify(e))
//   }
//   await appWindow.show()
// }
// router.afterEach(async (to, from) => {
//   // 在路由导航成功完成后执行的逻辑
//   if (isBooting) {
//     setTimeout(() => {
//       openMainWindow()
//     }, 200)
//   }
// })

export default router
