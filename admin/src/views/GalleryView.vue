<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold text-white">Gallery</h1>
          <p class="text-sm mt-0.5" style="color:#5a6880">{{ items.length }} images</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="showCategoriesModal = true"
            class="text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-white/10 hover:border-white/20"
            style="color:#8a9ab0"
          >
            ⚙ Categories
          </button>
          <button
            @click="openAddImageModal"
            class="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style="background:#b8964e;color:#1e2530"
          >
            + Add Image
          </button>
        </div>
      </div>

      <!-- Category tabs -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button
          v-for="cat in allTabCategories"
          :key="cat.slug"
          @click="activeCategory = cat.slug"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :style="activeCategory === cat.slug
            ? 'background:#b8964e;color:#1e2530'
            : 'background:rgba(255,255,255,0.05);color:#8a9ab0'"
        >
          {{ cat.label }}
          <span class="opacity-60 ml-1">({{ countByCategory(cat.slug) }})</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-sm py-8" style="color:#5a6880">Loading...</div>

      <!-- Grid -->
      <div v-else-if="filteredItems.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(item, i) in filteredItems"
          :key="item.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer"
          style="background:#3a4555;aspect-ratio:1"
          @click="openLightbox(i)"
        >
          <img :src="'/' + item.src" :alt="item.label" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <!-- Hover: subtle dim + expand hint -->
          <div
            class="absolute inset-0 flex flex-col items-end justify-start p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style="background:rgba(0,0,0,0.38)"
          >
            <span class="text-white/70 text-xs px-2 py-1 rounded-lg" style="background:rgba(0,0,0,0.4)">⤢</span>
          </div>
          <!-- Label strip at bottom always visible -->
          <div class="absolute bottom-0 left-0 right-0 px-3 py-2" style="background:linear-gradient(to top,rgba(0,0,0,0.7),transparent)">
            <p class="text-white text-xs truncate" dir="rtl">{{ item.label }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-16" style="color:#5a6880">
        <p class="text-4xl mb-3">🖼</p>
        <p>No images in this category</p>
      </div>
    </div>

    <!-- ─── Image Lightbox ─── -->
    <ImageLightbox
      v-if="lightboxOpen"
      :items="filteredItems"
      :initial-index="lightboxIndex"
      :categories="categories"
      @close="lightboxOpen = false"
      @update="onLightboxUpdate"
      @delete="onLightboxDelete"
    />

    <!-- ─── Add Image Modal ─── -->
    <Teleport to="body">
      <div
        v-if="showImageModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)"
        @click.self="closeImageModal"
      >
        <div class="w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/5" style="background:#1e2530">
          <h2 class="text-white font-semibold mb-5">Add Image</h2>

          <form @submit.prevent="addItem()" class="space-y-4">
            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Image file</label>
              <input type="file" accept="image/*" required @change="onFileChange" class="w-full text-sm" style="color:#8a9ab0" />
              <div v-if="preview" class="mt-3">
                <img :src="preview" class="w-full h-40 object-cover rounded-lg" />
              </div>
            </div>

            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Label (Hebrew)</label>
              <input
                v-model="imageForm.label"
                type="text" required dir="rtl" placeholder="שם התמונה"
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              />
            </div>

            <div>
              <label class="block text-sm mb-1.5" style="color:#8a9ab0">Category</label>
              <select
                v-model="imageForm.category"
                required
                class="w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              >
                <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
                  {{ cat.label }} ({{ cat.slug }})
                </option>
              </select>
            </div>

            <p v-if="imageFormError" class="text-red-400 text-sm">{{ imageFormError }}</p>

            <div class="flex gap-3 pt-1">
              <button type="submit" :disabled="imageSubmitting"
                class="flex-1 font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
                style="background:#b8964e;color:#1e2530">
                {{ imageSubmitting ? 'Uploading...' : 'Upload' }}
              </button>
              <button type="button" @click="closeImageModal"
                class="flex-1 py-2.5 rounded-lg text-sm"
                style="background:rgba(255,255,255,0.05);color:#d1d5db">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ─── Manage Categories Modal ─── -->
    <Teleport to="body">
      <div
        v-if="showCategoriesModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.75)"
        @click.self="showCategoriesModal = false"
      >
        <div class="w-full max-w-lg rounded-2xl shadow-2xl border border-white/5 flex flex-col" style="background:#1e2530;max-height:90vh">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-6 border-b border-white/5">
            <h2 class="text-white font-semibold">Manage Categories</h2>
            <button @click="showCategoriesModal = false" class="text-sm" style="color:#5a6880">✕</button>
          </div>

          <!-- Category list -->
          <div class="flex-1 overflow-auto p-4 space-y-2">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="rounded-xl border border-white/5"
              style="background:#3a4555"
            >
              <!-- View mode -->
              <div v-if="editingCatId !== cat.id" class="flex items-center justify-between px-4 py-3">
                <div>
                  <p class="text-white text-sm font-medium" dir="rtl">{{ cat.label }}</p>
                  <p class="text-xs mt-0.5 font-mono" style="color:#5a6880">{{ cat.slug }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs px-2 py-1 rounded" style="background:rgba(0,0,0,0.25);color:#8a9ab0">
                    {{ countByCategory(cat.slug) }} images
                  </span>
                  <button @click="startCatEdit(cat)" class="text-xs px-3 py-1.5 rounded-lg" style="background:rgba(255,255,255,0.07);color:#d1d5db">Edit</button>
                  <button @click="deleteCat(cat)" class="text-xs px-3 py-1.5 rounded-lg" style="background:rgba(239,68,68,0.12);color:#f87171">Delete</button>
                </div>
              </div>

              <!-- Edit mode -->
              <div v-else class="p-4 space-y-3">
                <div>
                  <label class="block text-xs mb-1" style="color:#8a9ab0">Label</label>
                  <input
                    v-model="catForm.label"
                    type="text" dir="rtl"
                    class="w-full rounded-lg px-3 py-2 text-white text-sm outline-none border"
                    style="background:#1e2530;border-color:rgba(255,255,255,0.1)"
                    @keydown.enter.prevent="saveCatEdit(cat)"
                    @keydown.escape="editingCatId = null"
                  />
                </div>
                <p v-if="catFormError" class="text-red-400 text-xs">{{ catFormError }}</p>
                <div class="flex gap-2">
                  <button @click="saveCatEdit(cat)" class="text-xs font-semibold px-4 py-2 rounded-lg" style="background:#b8964e;color:#1e2530">Save</button>
                  <button @click="editingCatId = null" class="text-xs px-4 py-2 rounded-lg" style="background:rgba(255,255,255,0.07);color:#d1d5db">Cancel</button>
                </div>
              </div>
            </div>

            <div v-if="!categories.length" class="text-center py-6 text-sm" style="color:#5a6880">No categories yet</div>
          </div>

          <!-- Add new category form -->
          <div class="p-4 border-t border-white/5">
            <p class="text-xs font-medium mb-3" style="color:#8a9ab0">ADD NEW CATEGORY</p>
            <form @submit.prevent="addCat" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs mb-1" style="color:#8a9ab0">Slug (unique key)</label>
                  <input
                    v-model="newCat.slug"
                    type="text" placeholder="e.g. gates"
                    class="w-full rounded-lg px-3 py-2 text-white text-sm outline-none border font-mono"
                    style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
                  />
                </div>
                <div>
                  <label class="block text-xs mb-1" style="color:#8a9ab0">Label (Hebrew)</label>
                  <input
                    v-model="newCat.label"
                    type="text" placeholder="שערים" dir="rtl"
                    class="w-full rounded-lg px-3 py-2 text-white text-sm outline-none border"
                    style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
                  />
                </div>
              </div>
              <p v-if="newCatError" class="text-red-400 text-xs">{{ newCatError }}</p>
              <button
                type="submit" :disabled="addingCat"
                class="w-full font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
                style="background:#b8964e;color:#1e2530"
              >
                {{ addingCat ? 'Adding...' : '+ Add Category' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout.vue';
import ImageLightbox from '../components/ImageLightbox.vue';

// ─── State ───
const items = ref([]);
const categories = ref([]);
const loading = ref(true);
const activeCategory = ref('all');

// Lightbox
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

// Image upload modal
const showImageModal = ref(false);
const editItem = ref(null);
const imageForm = ref({ label: '', category: '' });
const imageFormError = ref('');
const imageSubmitting = ref(false);
const selectedFile = ref(null);
const preview = ref('');

// Categories modal
const showCategoriesModal = ref(false);
const editingCatId = ref(null);
const catForm = ref({ label: '' });
const catFormError = ref('');
const newCat = ref({ slug: '', label: '' });
const newCatError = ref('');
const addingCat = ref(false);

// ─── Computed ───
const allTabCategories = computed(() => [
  { slug: 'all', label: 'All' },
  ...categories.value,
]);

const filteredItems = computed(() =>
  activeCategory.value === 'all'
    ? items.value
    : items.value.filter(i => i.category === activeCategory.value)
);

function countByCategory(slug) {
  if (slug === 'all') return items.value.length;
  return items.value.filter(i => i.category === slug).length;
}

function categoryLabel(slug) {
  return categories.value.find(c => c.slug === slug)?.label || slug;
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

// ─── Data fetching ───
async function fetchAll() {
  loading.value = true;
  try {
    const [catsRes, itemsRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/gallery'),
    ]);
    categories.value = catsRes.data;
    items.value = itemsRes.data;
    if (!imageForm.value.category && categories.value.length) {
      imageForm.value.category = categories.value[0].slug;
    }
  } finally {
    loading.value = false;
  }
}

// ─── Lightbox ───
function openLightbox(index) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
}

async function onLightboxUpdate(id, changes) {
  await axios.put(`/api/gallery/${id}`, changes, { headers: authHeaders() });
  const idx = items.value.findIndex(i => i.id === id);
  if (idx !== -1) items.value[idx] = { ...items.value[idx], ...changes };
}

async function onLightboxDelete(id) {
  await axios.delete(`/api/gallery/${id}`, { headers: authHeaders() });
  items.value = items.value.filter(i => i.id !== id);
  // Close lightbox if no items left in current filter
  if (filteredItems.value.length === 0) lightboxOpen.value = false;
}

// ─── Image upload modal ───
function openAddImageModal() {
  editItem.value = null;
  imageForm.value = { label: '', category: categories.value[0]?.slug || '' };
  imageFormError.value = '';
  preview.value = '';
  selectedFile.value = null;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
  editItem.value = null;
  imageForm.value = { label: '', category: categories.value[0]?.slug || '' };
  imageFormError.value = '';
  selectedFile.value = null;
  preview.value = '';
}

function onFileChange(e) {
  selectedFile.value = e.target.files[0];
  if (selectedFile.value) preview.value = URL.createObjectURL(selectedFile.value);
}

async function addItem() {
  imageFormError.value = '';
  imageSubmitting.value = true;
  try {
    const fd = new FormData();
    fd.append('image', selectedFile.value);
    fd.append('label', imageForm.value.label);
    fd.append('category', imageForm.value.category);
    const { data } = await axios.post('/api/gallery', fd, { headers: authHeaders() });
    items.value.push(data);
    closeImageModal();
  } catch (e) {
    imageFormError.value = e.response?.data?.error || 'Upload failed';
  } finally {
    imageSubmitting.value = false;
  }
}

async function deleteItem(item) {
  if (!confirm(`Delete "${item.label}"?`)) return;
  try {
    await axios.delete(`/api/gallery/${item.id}`, { headers: authHeaders() });
    items.value = items.value.filter(i => i.id !== item.id);
  } catch {
    alert('Failed to delete');
  }
}

// ─── Category CRUD ───
function startCatEdit(cat) {
  editingCatId.value = cat.id;
  catForm.value = { label: cat.label };
  catFormError.value = '';
}

async function saveCatEdit(cat) {
  catFormError.value = '';
  try {
    const { data } = await axios.put(`/api/categories/${cat.id}`, catForm.value, { headers: authHeaders() });
    const idx = categories.value.findIndex(c => c.id === cat.id);
    if (idx !== -1) categories.value[idx] = data;
    editingCatId.value = null;
  } catch (e) {
    catFormError.value = e.response?.data?.error || 'Update failed';
  }
}

async function deleteCat(cat) {
  if (!confirm(`Delete category "${cat.label}"?`)) return;
  try {
    await axios.delete(`/api/categories/${cat.id}`, { headers: authHeaders() });
    categories.value = categories.value.filter(c => c.id !== cat.id);
    if (activeCategory.value === cat.slug) activeCategory.value = 'all';
  } catch (e) {
    alert(e.response?.data?.error || 'Failed to delete');
  }
}

async function addCat() {
  newCatError.value = '';
  if (!newCat.value.slug || !newCat.value.label) {
    newCatError.value = 'Both slug and label are required';
    return;
  }
  addingCat.value = true;
  try {
    const { data } = await axios.post('/api/categories', newCat.value, { headers: authHeaders() });
    categories.value.push(data);
    newCat.value = { slug: '', label: '' };
  } catch (e) {
    newCatError.value = e.response?.data?.error || 'Failed to add';
  } finally {
    addingCat.value = false;
  }
}

onMounted(fetchAll);
</script>
