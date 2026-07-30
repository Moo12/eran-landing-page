<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold text-white">Testimonials</h1>
          <p class="text-sm mt-0.5" style="color:#5a6880">{{ items.length }} reviews</p>
        </div>
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style="background:#b8964e;color:#1e2530"
        >
          + Add Testimonial
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-sm py-8" style="color:#5a6880">Loading...</div>

      <!-- List -->
      <div v-else-if="items.length" class="space-y-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="rounded-xl p-5 border border-white/5"
          style="background:#3a4555"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm mb-2" style="color:#b8964e">{{ '★'.repeat(item.stars || 5) }}</div>
              <p class="text-sm leading-relaxed mb-3" style="color:#d1d5db" dir="rtl">{{ item.text }}</p>
              <p class="text-sm font-medium" style="color:#d4af6a" dir="rtl">{{ item.author }}</p>
              <p class="text-xs mt-0.5" style="color:#5a6880" dir="rtl">{{ item.role }}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                @click="startEdit(item)"
                class="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style="background:rgba(255,255,255,0.07);color:#d1d5db"
              >Edit</button>
              <button
                @click="deleteItem(item)"
                class="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style="background:rgba(239,68,68,0.12);color:#f87171"
              >Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16" style="color:#5a6880">
        <p class="text-4xl mb-3">💬</p>
        <p>No testimonials yet</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showAddModal || editItem"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)"
        @click.self="closeModal"
      >
        <div class="w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/5" style="background:#1e2530">
          <h2 class="text-white font-semibold mb-5">{{ editItem ? 'Edit Testimonial' : 'Add Testimonial' }}</h2>

          <form @submit.prevent="editItem ? updateItem() : addItem()" class="space-y-4">
            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Author Name</label>
              <input
                v-model="form.author"
                type="text"
                required
                dir="rtl"
                placeholder="שם הלקוח"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>

            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Location / Role</label>
              <input
                v-model="form.role"
                type="text"
                dir="rtl"
                placeholder="עיר"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>

            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Review Text</label>
              <textarea
                v-model="form.text"
                required
                dir="rtl"
                rows="4"
                placeholder="הכנס את הביקורת כאן..."
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border resize-none"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>

            <div>
              <label class="block text-sm mb-2" style="color:#8a9ab0">Stars</label>
              <div class="flex gap-1">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  @click="form.stars = n"
                  class="text-2xl transition-opacity"
                  :style="n <= form.stars ? 'color:#b8964e' : 'color:#3a4555;filter:brightness(2)'"
                >★</button>
              </div>
            </div>

            <p v-if="formError" class="text-red-400 text-sm">{{ formError }}</p>

            <div class="flex gap-3 pt-1">
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 font-semibold py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
                style="background:#b8964e;color:#1e2530"
              >
                {{ submitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 py-2.5 rounded-lg text-sm"
                style="background:rgba(255,255,255,0.05);color:#d1d5db"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout.vue';

const items = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const editItem = ref(null);
const form = ref({ author: '', role: '', text: '', stars: 5 });
const formError = ref('');
const submitting = ref(false);

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

async function fetchItems() {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/testimonials');
    items.value = data;
  } finally {
    loading.value = false;
  }
}

async function addItem() {
  formError.value = '';
  submitting.value = true;
  try {
    const { data } = await axios.post('/api/testimonials', form.value, { headers: authHeaders() });
    items.value.push(data);
    closeModal();
  } catch (e) {
    formError.value = e.response?.data?.error || 'Failed to add';
  } finally {
    submitting.value = false;
  }
}

function startEdit(item) {
  editItem.value = item;
  form.value = { author: item.author, role: item.role || '', text: item.text, stars: item.stars || 5 };
}

async function updateItem() {
  formError.value = '';
  submitting.value = true;
  try {
    await axios.put(`/api/testimonials/${editItem.value.id}`, form.value, { headers: authHeaders() });
    const idx = items.value.findIndex(i => i.id === editItem.value.id);
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...form.value };
    closeModal();
  } catch (e) {
    formError.value = e.response?.data?.error || 'Update failed';
  } finally {
    submitting.value = false;
  }
}

async function deleteItem(item) {
  if (!confirm(`Delete testimonial by "${item.author}"?`)) return;
  try {
    await axios.delete(`/api/testimonials/${item.id}`, { headers: authHeaders() });
    items.value = items.value.filter(i => i.id !== item.id);
  } catch {
    alert('Failed to delete');
  }
}

function closeModal() {
  showAddModal.value = false;
  editItem.value = null;
  form.value = { author: '', role: '', text: '', stars: 5 };
  formError.value = '';
}

onMounted(fetchItems);
</script>
