import { createRouter, createWebHashHistory } from "vue-router";
import MainWindow from "../views/MainWindow.vue";

const router = createRouter({
  history: createWebHashHistory("#/"),
  routes: [
    {
      path: "/",
      name: "mainWindow",
      component: MainWindow,
      redirect: "/seat",
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: "/seat",
          name: "seat",
          component: () => import("../views/SeatView.vue"),
        },
        {
          path: "/schedule",
          name: "schedule",
          component: () => import("../views/ScheduleView.vue"),
        },
        {
          path:"/randomSelection",
          name:"randomSelection",
          component: () => import("../views/RandomSelectionView.vue"),
        },
        {
          path: "/person",
          name: "personManage",
          component: () => import("../views/PersonManageView.vue"),
        },
        {
          path: "/setting",
          name: "setting",
          redirect: "/setting/seat",
          component: () => import("../views/SettingView.vue"),
          children: [
            {
              path: "/setting/seat",
              name: "seatSetting",
              component: () => import("../views/Setting/SeatSettingView.vue"),
            },
            {
              path: "/setting/bgm",
              name: "bgmSetting",
              redirect: "/setting/bgm/play",
              children: [
                {
                  path: "/setting/bgm/play",
                  name: "playSetting",
                  component: () => import("../views/Setting/PlaySettingView.vue"),
                },
                {
                  path: "/setting/bgm/playlist",
                  name: "playlistSetting",
                  component: () => import("../views/Setting/PlaylistSettingView.vue"),
                },
              ],
            },
            // {
            //   path: "/setting/person",
            //   name: "personManage",
            //   component: () => import("../views/PersonManageView.vue"),
            // },
            {
              path: "/setting/debug",
              name: "debugTool",
              component: () => import("../views/Setting/DebugToolView.vue"),
            },
          ],
        },
        {
          path: "/about",
          name: "about",
          component: () => import("../views/AboutView.vue"),
        },
      ],
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/TransparentView.vue"),
    },
  ],
});

export default router;
