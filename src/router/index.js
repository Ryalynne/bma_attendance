import { createRouter, createWebHashHistory } from "vue-router";
const routes = [
  {
    path: "/",
    component: () => import("@/views/HomePage.vue"), // adjust the path based on your project structure
  },
  {
    path: "/setting",
    component: () => import("@/views/SettingPage.vue"),
  },
  // Add more routes as needed
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
