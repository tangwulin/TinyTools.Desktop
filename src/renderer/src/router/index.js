import { createRouter, createWebHashHistory } from 'vue-router'
import { useSettingStore } from '../stores/setting'
import MainWindow from '../views/MainWindow.vue'

const router = createRouter({
  history: createWebHashHistory('#/'),
  routes: [
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('../views/WelcomeView.vue'),
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/SetupView.vue'),
      redirect: '/setup/person',
      children: [
        {
          path: '/setup/person',
          name: 'importPerson',
          component: () => import('../views/Setup/ImportPersonView.vue'),
        },
        {
          path: '/setup/seat',
          name: 'assignSeat',
          component: () => import('../views/Setup/AssignSeatView.vue'),
        },
        {
          path: '/setup/schedule',
          name: 'setup schedule',
          component: () => import('../views/Setup/ScheduleView.vue'),
        },
        {
          path: '/setup/work-schedule',
          name: 'setup workSchedule',
          component: () => import('../views/Setup/WorkScheduleView.vue'),
        },
        {
          path: '/setup/done',
          name: 'setup done',
          component: () => import('../views/Setup/SetupDoneView.vue'),
        },
      ],
    },
    {
      path: '/',
      name: 'mainWindow',
      component: MainWindow,
      redirect: '/seat',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: '/seat',
          name: 'seat',
          component: () => import('../views/SeatView.vue'),
        },
        {
          path: '/schedule',
          name: 'schedule',
          component: () => import('../views/ScheduleView.vue'),
        },
        {
          path: '/randomSelection',
          name: 'randomSelection',
          component: () => import('../views/RandomSelectionView.vue'),
        },
        {
          path: '/person',
          name: 'personManage',
          component: () => import('../views/PersonManageView.vue'),
        },
        {
          path: '/score',
          name: 'score',
          component: () => import('../views/ScoreView.vue'),
        },
        {
          path: '/score/report',
          name: 'scoreReport',
          component: () => import('../views/ScoreReport.vue'),
          children: [
            {
              path: '/score/report/detail',
              name: 'scoreReportDetail',
              component: () => import('../views/Score/ScoreReportDetail.vue'),
            },
          ],
        },
        {
          path: 'group',
          name: 'groupManage',
          component: () => import('../views/GroupManageView.vue'),
        },
        {
          path: '/setting',
          name: 'setting',
          redirect: '/setting/seat',
          component: () => import('../views/SettingView.vue'),
          children: [
            {
              path: '/setting/seat',
              name: 'seatSetting',
              component: () => import('../views/Setting/SeatSettingView.vue'),
            },
            {
              path: '/setting/avatarSetting',
              name: 'avatarSetting',
              component: () => import('../views/Setting/AvatarSetting.vue'),
            },
            {
              path: '/setting/bgm',
              name: 'bgmSetting',
              redirect: '/setting/bgm/play',
              children: [
                {
                  path: '/setting/bgm/play',
                  name: 'playSetting',
                  component: () => import('../views/Setting/PlaySettingView.vue'),
                },
                {
                  path: '/setting/bgm/playlist',
                  name: 'playlistSetting',
                  component: () => import('../views/Setting/PlaylistSettingView.vue'),
                },
              ],
            },
            {
              path: '/setting/debug',
              name: 'debugTool',
              component: () => import('../views/Setting/DebugToolView.vue'),
            },
            {
              path: '/setting/dataExport',
              name: 'dataExport',
              component: () => import('../views/Setting/DataExport.vue'),
            },
          ],
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
    {
      path: '/dock',
      name: 'dock',
      component: () => import('../views/DockView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const settingStore = useSettingStore()
  if (settingStore.isFirstSetup && to.name !== 'welcome')
  {
    if (!to.path.includes('setup'))
    {
      next({ name: 'welcome' })
    }
    else
    {
      next()
    }
  }
  else
  {
    next()
  }
})

export default router
