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
          path:"/dashboard",
          name:"dashboard",
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
