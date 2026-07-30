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
        <h1 class="text-white font-semibold text-lg mb-1">{{ isFirstSetup ? 'Create admin account' : 'Add user' }}</h1>
        <p v-if="isFirstSetup" class="text-sm mb-6" style="color:#8a9ab0">First-time setup — no admin exists yet.</p>
        <p v-else class="text-sm mb-6" style="color:#8a9ab0">You are logged in as <strong class="text-white">{{ currentUsername }}</strong>.</p>

        <form @submit.prevent="register" class="space-y-4">
          <div>
            <label class="block text-sm mb-1.5" style="color:#8a9ab0">Username</label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="choose a username"
              autocomplete="username"
              class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border transition-colors"
              style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
            />
          </div>
          <div>
            <label class="block text-sm mb-1.5" style="color:#8a9ab0">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="at least 6 characters"
              autocomplete="new-password"
              class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border transition-colors"
              style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
            />
          </div>
          <div>
            <label class="block text-sm mb-1.5" style="color:#8a9ab0">Confirm password</label>
            <input
              v-model="form.confirm"
              type="password"
              required
              placeholder="repeat password"
              autocomplete="new-password"
              class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border transition-colors"
              style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
            />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
          <p v-if="success" class="text-green-400 text-sm">{{ success }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full font-semibold py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
            style="background:#b8964e;color:#1e2530"
          >
            {{ loading ? 'Creating...' : isFirstSetup ? 'Create account' : 'Add user' }}
          </button>
        </form>

        <p class="text-center text-sm mt-5" style="color:#5a6880">
          <router-link to="/admin/login" style="color:#b8964e">← Back to login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({ username: '', password: '', confirm: '' });
const error = ref('');
const success = ref('');
const loading = ref(false);
const isFirstSetup = ref(false);

const currentUsername = computed(() => {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || '';
  } catch { return ''; }
});

onMounted(async () => {
  const { data } = await axios.get('/api/auth/setup-status');
  isFirstSetup.value = data.needsSetup;
  // If setup is done and not logged in, redirect to login
  if (!data.needsSetup && !localStorage.getItem('admin_token')) {
    router.push('/admin/login');
  }
});

async function register() {
  error.value = '';
  success.value = '';
  if (form.value.password !== form.value.confirm) {
    error.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  try {
    const headers = {};
    const token = localStorage.getItem('admin_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    const { data } = await axios.post('/api/auth/register', {
      username: form.value.username,
      password: form.value.password,
    }, { headers });

    if (isFirstSetup.value) {
      localStorage.setItem('admin_token', data.token);
      router.push('/admin/gallery');
    } else {
      success.value = `User "${form.value.username}" created successfully.`;
      form.value = { username: '', password: '', confirm: '' };
    }
  } catch (e) {
    error.value = e.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>
