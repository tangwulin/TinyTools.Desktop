import {
  createRouter,
  createWebHashHistory,
  Router,
  RouteRecordRaw,
  RouterOptions
} from 'vue-router'
import { useSettingStore } from '../stores/setting' //由于router的API默认使用了类型进行初始化，内部包含类型定义，所以本文内部代码中的所有数据类型是可以省略的
import MainWindow from '../views/MainWindow.vue' //由于router的API默认使用了类型进行初始化，内部包含类型定义，所以本文内部代码中的所有数据类型是可以省略的
//由于router的API默认使用了类型进行初始化，内部包含类型定义，所以本文内部代码中的所有数据类型是可以省略的
//RouterRecordRaw是路由组件对象
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainWindow,
    name: 'mainWindow',
    redirect: { name: 'seat' },
    children: [
      { path: '/seat', name: 'seat', component: () => import('../views/MainWindow/SeatView.vue') },
      // { path: '/lottery', name: 'lottery', component: () => import('../views/MainWindow/LotteryView.vue') },
      // { path: '/help', name: 'help', component: () => import('../views/MainWindow/HelpView.vue') },
      // { path: '/debug', name: 'debug', component: () => import('../views/MainWindow/DebugView.vue') },
      {
        path: '/score',
        name: 'score',
        component: () => import('../views/MainWindow/ScoreView.vue')
      },
      {
        path: '/score/report',
        name: 'scoreReport',
        component: () => import('../views/MainWindow/ScoreReport.vue'),
        children: [
          {
            path: '/score/report/detail',
            name: 'scoreReportDetail',
            component: () => import('../views/MainWindow/Score/ScoreReportDetail.vue')
          }
        ]
      },
      {
        path: '/randomSelection',
        name: 'randomSelection',
        component: () => import('../views/MainWindow/RandomSelection.vue')
      },
      {
        path: '/personManage',
        name: 'personManage',
        component: () => import('../views/MainWindow/PersonManage.vue')
      },
      {
        path: '/groupManage',
        name: 'groupManage',
        component: () => import('../views/MainWindow/GroupManage.vue')
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('../views/MainWindow/AboutView.vue')
      },
      {
        path: '/setting',
        name: 'setting',
        redirect: '/setting/seat',
        component: () => import('../views/MainWindow/SettingView.vue'),
        children: [
          {
            path: '/setting/seat',
            name: 'seatSetting',
            component: () => import('../views/MainWindow/Setting/SeatSettingView.vue')
          },
          {
            path: '/setting/avatarSetting',
            name: 'avatarSetting',
            component: () => import('../views/MainWindow/Setting/AvatarSetting.vue')
          },
          {
            path: '/setting/bgm',
            name: 'bgmSetting',
            redirect: '/setting/bgm/play',
            children: [
              {
                path: '/setting/bgm/play',
                name: 'playSetting',
                component: () => import('../views/MainWindow/Setting/PlaySettingView.vue')
              },
              {
                path: '/setting/bgm/playlist',
                name: 'playlistSetting',
                component: () => import('../views/MainWindow/Setting/PlaylistSettingView.vue')
              }
            ]
          },
          {
            path: '/setting/debug',
            name: 'debugTool',
            component: () => import('../views/MainWindow/Setting/DebugToolView.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/MainWindow/WelcomeView.vue')
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('../views/MainWindow/SetupView.vue'),
    redirect: '/setup/person',
    children: [
      {
        path: '/setup/person',
        name: 'importPerson',
        component: () => import('../views/MainWindow/Setup/ImportPersonView.vue')
      },
      {
        path: '/setup/seat',
        name: 'assignSeat',
        component: () => import('../views/MainWindow/Setup/AssignSeatView.vue')
      },
      {
        path: '/setup/schedule',
        name: 'setup schedule',
        component: () => import('../views/MainWindow/Setup/ScheduleView.vue')
      },
      {
        path: '/setup/work-schedule',
        name: 'setup workSchedule',
        component: () => import('../views/MainWindow/Setup/WorkScheduleView.vue')
      },
      {
        path: '/setup/done',
        name: 'setup done',
        component: () => import('../views/MainWindow/Setup/SetupDoneView.vue')
      }
    ]
  },
  {
    path: '/dock',
    name: 'dock',
    component: () => import('../views/DockWindow.vue')
  }
]

// RouterOptions是路由选项类型
const options: RouterOptions = {
  history: createWebHashHistory(),
  routes
}

// Router是路由对象类型
const router: Router = createRouter(options)
router.beforeEach((to, _, next) => {
  const settingStore = useSettingStore()
  if (settingStore.isFirstSetup && to.name !== 'welcome') {
    if (!to.path.includes('setup')) {
      next({ name: 'welcome' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
