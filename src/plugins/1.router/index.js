import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupGuards } from './guards'

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])

    return route
  }

  return setupLayouts([route])[0]
}
// http://localhost:5173/products
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages, ...[
      {
        path: '/roles-y-permisos',
        name: 'roles-y-permisos',
        component: () => import('@/pages/roles-permisos/index.vue'),
        meta: {
          permisssion: 'list_rol',
        }
      },
      {
        path: '/client-scheduling',
        name: 'client-scheduling',
        component: () => import('@/pages/client-scheduling/index.vue'),
        meta: {
          permisssion: 'all',
        }
      },
      {
        path: '/pet/daily-list',
        name: 'pet-daily-list',
        component: () => import('@/pages/pet/daily-list.vue'),
        meta: {
          permisssion: 'list_pet',
        }
      },
      {
        path: '/pet/daily-add',
        name: 'pet-daily-add',
        component: () => import('@/pages/pet/daily-add.vue'),
        meta: {
          permisssion: 'register_pet',
        }
      },
      {
        path: '/pet/daily-edit/:id',
        name: 'pet-daily-edit-id',
        component: () => import('@/pages/pet/daily-edit/[id].vue'),
        meta: {
          permisssion: 'edit_pet',
        }
      },
    ]].map(route => recursiveLayouts(route)),
  ],
})

setupGuards(router)
export { router }
export default function (app) {
  app.use(router)
}
