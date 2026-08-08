<template>
  <div class="flex flex-col gap-5">

    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm" style="color:#5a6880">{{ subtitle }}</p>
      <label class="cursor-pointer flex-shrink-0">
        <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="handleUpload" />
        <div
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :style="uploading
            ? 'background:rgba(184,150,78,0.06);color:#8a9ab0;cursor:not-allowed'
            : 'background:rgba(184,150,78,0.14);color:#b8964e;cursor:pointer'"
        >{{ uploading ? '⏳ מעלה...' : '+ העלה תמונה חדשה' }}</div>
      </label>
    </div>

    <!-- Feedback -->
    <p v-if="successMsg" class="text-sm text-green-400">✓ {{ successMsg }}</p>
    <p v-if="errorMsg" class="text-sm text-red-400">⚠ {{ errorMsg }}</p>

    <!-- Image grid -->
    <div v-if="images.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="img in images"
        :key="img.id"
        class="relative rounded-xl overflow-hidden group cursor-pointer"
        style="aspect-ratio:16/9;background:#1e2530"
        :style="img.is_active ? 'outline:2px solid #b8964e;outline-offset:2px' : ''"
        @click="!img.is_active && activate(img.id)"
      >
        <img :src="imgUrl(img)" :alt="title" class="w-full h-full object-cover" loading="lazy" />

        <!-- Active badge -->
        <div v-if="img.is_active"
          class="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
          style="background:#b8964e;color:#1e2530">
          פעיל
        </div>

        <!-- Hover overlay for non-active images -->
        <div v-if="!img.is_active"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style="background:rgba(0,0,0,0.65)">
          <span class="text-xs font-semibold px-3 py-1.5 rounded-lg" style="background:#b8964e;color:#1e2530">הפעל תמונה זו</span>
          <button
            @click.stop="remove(img.id)"
            class="text-xs px-3 py-1 rounded-lg"
            style="background:rgba(248,113,113,0.2);color:#f87171">
            מחק
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-sm py-8 text-center" style="color:#5a6880">לא הועלו תמונות עדיין</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  slot: { type: String, required: true },
  title: String,
  subtitle: String,
});

const images = ref([]);
const uploading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const ERROR_MAP = {
  'Invalid token': 'פג תוקף ההתחברות — אנא התנתק והתחבר מחדש',
  'image is required': 'לא נבחרה תמונה',
  'Unknown slot': 'פעולה לא חוקית',
};

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
}

function imgUrl(img) {
  const base = img.src.startsWith('/') || img.src.startsWith('http') ? img.src : `/${img.src}`;
  return img.uploaded_at && img.src.startsWith('uploads/') ? `${base}?v=${img.uploaded_at}` : base;
}

function feedback(ok, msg) {
  if (ok) { successMsg.value = msg; errorMsg.value = ''; setTimeout(() => { successMsg.value = ''; }, 3000); }
  else { errorMsg.value = msg; successMsg.value = ''; }
}

async function load() {
  const res = await fetch(`/api/settings/${props.slot}/images`, { headers: authHeaders() });
  if (res.ok) images.value = await res.json();
}

async function handleUpload(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  uploading.value = true;
  errorMsg.value = '';
  try {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`/api/settings/${props.slot}`, {
      method: 'POST', headers: authHeaders(), body: fd,
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(ERROR_MAP[error] || 'שגיאה בהעלאת התמונה — נסה שוב');
    }
    await load();
    feedback(true, 'התמונה הועלתה והופעלה בהצלחה');
  } catch (e) {
    feedback(false, e.message);
  } finally {
    uploading.value = false;
  }
}

async function activate(id) {
  try {
    const res = await fetch(`/api/settings/${props.slot}/activate/${id}`, {
      method: 'PUT', headers: authHeaders(),
    });
    if (!res.ok) throw new Error();
    await load();
    feedback(true, 'התמונה הופעלה בהצלחה');
  } catch {
    feedback(false, 'שגיאה בהפעלת התמונה — נסה שוב');
  }
}

async function remove(id) {
  try {
    const res = await fetch(`/api/settings/${props.slot}/images/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error || 'שגיאה במחיקה');
    }
    await load();
    feedback(true, 'התמונה נמחקה');
  } catch (e) {
    feedback(false, e.message);
  }
}

onMounted(load);
</script>
