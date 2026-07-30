<template>
  <div class="min-h-screen flex" style="background:#0f1520">
    <!-- Sidebar -->
    <aside class="w-56 flex-shrink-0 flex flex-col border-r border-white/5" style="background:#1e2530">
      <!-- Brand -->
      <div class="p-5 border-b border-white/5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style="background:#b8964e;color:#1e2530">ע</div>
          <div>
            <p class="text-white text-sm font-semibold leading-tight">ערן ישראלי</p>
            <p class="text-xs" style="color:#5a6880">Admin Panel</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="$route.path === item.to
            ? 'text-gold'
            : 'text-gray-400 hover:text-white hover:bg-white/5'"
          :style="$route.path === item.to ? 'background:rgba(184,150,78,0.12)' : ''"
        >
          <span class="text-base w-5 text-center">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Footer links -->
      <div class="p-3 border-t border-white/5 space-y-1">
        <a
          href="/"
          target="_blank"
          class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors"
          style="color:#5a6880"
          onmouseover="this.style.color='#fff'"
          onmouseout="this.style.color='#5a6880'"
        >
          <span>↗</span> View Site
        </a>
        <button
          @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left"
          style="color:#5a6880"
          onmouseover="this.style.color='#f87171'"
          onmouseout="this.style.color='#5a6880'"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navItems = [
  { to: '/admin/gallery', icon: '🖼', label: 'Gallery' },
  { to: '/admin/testimonials', icon: '💬', label: 'Testimonials' },
  { to: '/admin/users', icon: '👤', label: 'Users' },
];

function logout() {
  localStorage.removeItem('admin_token');
  router.push('/admin/login');
}
</script>
