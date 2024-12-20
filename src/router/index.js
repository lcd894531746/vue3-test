import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Home from '../views/Home.vue'
import Table from '../views/Table.vue'
import Echarts from '../views/Echarts.vue'

const routes = [
  {
    path: '/',
    name: 'layout',
    component: Index,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home',
        component: Home,
        meta: {
          title: '首页'
        }
      },
      {
        path: '/table',
        name: 'table',
        component: Table,
        meta: {
          title: 'table页面'
        }
      },
      {
        path: '/echarts',
        name: 'echarts',
        component: Echarts,
        meta: {
          title: 'echarts页面'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
