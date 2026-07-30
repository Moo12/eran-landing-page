import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import GalleryView from './views/GalleryView.vue';
import TestimonialsView from './views/TestimonialsView.vue';
import UsersView from './views/UsersView.vue';
import './style.css';

const routes = [
  { path: '/admin/login', component: Login },
  { path: '/admin/register', component: Register },
  { path: '/admin/', redirect: '/admin/gallery' },
  { path: '/admin/gallery', component: GalleryView, meta: { requiresAuth: true } },
  { path: '/admin/testimonials', component: TestimonialsView, meta: { requiresAuth: true } },
  { path: '/admin/users', component: UsersView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/admin/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token');
  if (to.meta.requiresAuth && !token) return '/admin/login';
  if (to.path === '/admin/login' && token) return '/admin/gallery';
});

const app = createApp(App);
app.use(router);
app.mount('#app');
