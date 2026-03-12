import { createRouter, createWebHistory } from 'vue-router'

import TopPage from '../views/TopPage.vue';
import ErrorPage from '../views/ErrorPage.vue';

export enum APP_PATH {
  ROOT = '/',
  TOP = '/top',
  ERROR = '/error'
}

export const SCREEN_ID = {
  ROOT: '000',
  TOP: '001',
  ERROR: '999'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: APP_PATH.TOP,
      component: TopPage,
      meta: {
        screenId: SCREEN_ID.TOP,
        title: 'トップページ'
      }
    },
    {
      path: APP_PATH.ERROR,
      component: ErrorPage,
      meta: {
        screenId: SCREEN_ID.ERROR,
        title: 'エラー'
      }
    }
  ],
})

export default router
