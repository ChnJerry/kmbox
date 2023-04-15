import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/fyManage'
    },
    {
        path: '/home',
        redirect: '/fyManage'
    },
    {
        path: '/fyManage',
        name: 'fyManage',
        component: () => import('@renderer/pages/fyManage.vue')
    },
    {
        path: '/fyFocusManage',
        name: 'fyFocusManage',
        component: () => import('@renderer/pages/fyFocusManage.vue')
    },
    {
        path: '/terminalRemoteControl',
        name: 'terminalRemoteControl',
        component: () => import('@renderer/pages/terminalRemoteControl.vue')
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@renderer/pages/settings.vue')
    },
    {
        path: '/songInfo',
        name: 'songInfo',
        component: () => import('@renderer/pages/songInfo.vue')
    },
    {
        path: '/lightControl',
        name: 'lightControl',
        component: () => import('@renderer/pages/lightControl.vue')
    },
]
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router