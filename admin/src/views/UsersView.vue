<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold text-white">Users</h1>
          <p class="text-sm mt-0.5" style="color:#5a6880">{{ users.length }} admin account{{ users.length !== 1 ? 's' : '' }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style="background:#b8964e;color:#1e2530"
        >
          + Add User
        </button>
      </div>

      <div v-if="loading" class="text-sm py-8" style="color:#5a6880">Loading...</div>

      <div v-else class="space-y-2">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between rounded-xl px-5 py-4 border border-white/5"
          style="background:#3a4555"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style="background:#1e2530;color:#b8964e">
              {{ user.username[0].toUpperCase() }}
            </div>
            <div>
              <p class="text-white text-sm font-medium">{{ user.username }}</p>
              <p class="text-xs" style="color:#5a6880">{{ user.username === currentUsername ? 'You' : 'Admin' }}</p>
            </div>
          </div>
          <button
            v-if="user.username !== currentUsername"
            @click="deleteUser(user)"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style="background:rgba(239,68,68,0.12);color:#f87171"
          >Remove</button>
          <span v-else class="text-xs px-3 py-1.5 rounded-lg" style="color:#5a6880;background:rgba(255,255,255,0.03)">Current</span>
        </div>
      </div>
    </div>

    <!-- Add user modal -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)"
        @click.self="closeModal"
      >
        <div class="w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-white/5" style="background:#1e2530">
          <h2 class="text-white font-semibold mb-5">Add User</h2>

          <form @submit.prevent="addUser" class="space-y-4">
            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Username</label>
              <input
                v-model="form.username"
                type="text"
                required
                placeholder="username"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>
            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Password</label>
              <input
                v-model="form.password"
                type="password"
                required
                placeholder="at least 6 characters"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>
            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Confirm password</label>
              <input
                v-model="form.confirm"
                type="password"
                required
                placeholder="repeat password"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>

            <p v-if="formError" class="text-red-400 text-sm">{{ formError }}</p>

            <div class="flex gap-3 pt-1">
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
                style="background:#b8964e;color:#1e2530"
              >{{ submitting ? 'Creating...' : 'Create' }}</button>
              <button type="button" @click="closeModal" class="flex-1 py-2.5 rounded-lg text-sm" style="background:rgba(255,255,255,0.05);color:#d1d5db">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout.vue';

const users = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const form = ref({ username: '', password: '', confirm: '' });
const formError = ref('');
const submitting = ref(false);

const currentUsername = computed(() => {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).username || '';
  } catch { return ''; }
});

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

async function fetchUsers() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/auth/users', { headers: authHeaders() });
    users.value = data;
  } finally {
    loading.value = false;
  }
}

async function addUser() {
  formError.value = '';
  if (form.value.password !== form.value.confirm) {
    formError.value = 'Passwords do not match';
    return;
  }
  submitting.value = true;
  try {
    await axios.post('/api/auth/register', {
      username: form.value.username,
      password: form.value.password,
    }, { headers: authHeaders() });
    await fetchUsers();
    closeModal();
  } catch (e) {
    formError.value = e.response?.data?.error || 'Failed to create user';
  } finally {
    submitting.value = false;
  }
}

async function deleteUser(user) {
  if (!confirm(`Remove user "${user.username}"?`)) return;
  try {
    await axios.delete(`/api/auth/users/${user.id}`, { headers: authHeaders() });
    users.value = users.value.filter(u => u.id !== user.id);
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to remove user');
  }
}

function closeModal() {
  showAddModal.value = false;
  form.value = { username: '', password: '', confirm: '' };
  formError.value = '';
}

onMounted(fetchUsers);
</script>
