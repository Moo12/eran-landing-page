<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background:#1e2530">
    <div class="w-full max-w-sm">
      <!-- Brand -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style="background:#b8964e;color:#1e2530">ע</div>
          <span class="text-white font-semibold text-xl">ערן ישראלי</span>
        </div>
        <p class="text-sm" style="color:#5a6880">Admin Panel</p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl p-8 border border-white/5 shadow-2xl" style="background:#3a4555">
        <h1 class="text-white font-semibold text-lg mb-6">Sign in</h1>

        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-sm mb-1.5" style="color:#8a9ab0">Username</label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="admin"
              autocomplete="username"
              class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors border"
              style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
              @focus="e => e.target.style.borderColor='#b8964e'"
              @blur="e => e.target.style.borderColor='rgba(255,255,255,0.1)'"
            />
          </div>
          <div>
            <label class="block text-sm mb-1.5" style="color:#8a9ab0">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-colors border"
              style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
              @focus="e => e.target.style.borderColor='#b8964e'"
              @blur="e => e.target.style.borderColor='rgba(255,255,255,0.1)'"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full font-semibold py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
            style="background:#b8964e;color:#1e2530"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p v-if="showRegisterLink" class="text-center text-sm mt-5" style="color:#5a6880">
          No account yet?
          <router-link to="/admin/register" style="color:#b8964e">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({ username: '', password: '' });
const error = ref('');
const loading = ref(false);
const showRegisterLink = ref(false);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/auth/setup-status');
    showRegisterLink.value = data.needsSetup;
  } catch { /* ignore */ }
});

async function login() {
  error.value = '';
  loading.value = true;
  try {
    const { data } = await axios.post('/api/auth/login', form.value);
    localStorage.setItem('admin_token', data.token);
    router.push('/admin/gallery');
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
