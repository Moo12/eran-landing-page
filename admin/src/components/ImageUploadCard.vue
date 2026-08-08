<template>
  <div class="rounded-xl p-5 flex flex-col gap-4" style="background:#1e2530;border:1px solid rgba(255,255,255,0.06)">
    <div>
      <p class="text-white font-medium text-sm">{{ title }}</p>
      <p class="text-xs mt-0.5" style="color:#5a6880">{{ subtitle }}</p>
    </div>

    <!-- Current image preview -->
    <div class="rounded-lg overflow-hidden" style="aspect-ratio:16/9;background:#0f1520">
      <img
        v-if="current"
        :src="imgSrc"
        :alt="title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center" style="color:#3a4555">
        <span class="text-3xl">🖼</span>
      </div>
    </div>

    <!-- Upload -->
    <div>
      <label class="block cursor-pointer">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFile"
        />
        <div
          class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :style="loading
            ? 'background:rgba(184,150,78,0.08);color:#8a9ab0;cursor:not-allowed'
            : 'background:rgba(184,150,78,0.14);color:#b8964e;cursor:pointer'"
        >
          <span v-if="loading">⏳ מעלה...</span>
          <span v-else>📷 בחר תמונה חדשה</span>
        </div>
      </label>

      <p v-if="success" class="text-xs mt-2 text-green-400">✓ התמונה עודכנה בהצלחה</p>
      <p v-if="error" class="text-xs mt-2 text-red-400">⚠ {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: String,
  subtitle: String,
  current: String,
  loading: Boolean,
  error: String,
  success: Boolean,
});
const emit = defineEmits(['upload']);
const fileInput = ref(null);

// Ensure paths are root-relative so they work from /admin/
const imgSrc = computed(() => {
  if (!props.current) return '';
  return props.current.startsWith('http') || props.current.startsWith('/') ? props.current : `/${props.current}`;
});

function handleFile(e) {
  const file = e.target.files?.[0];
  if (file) emit('upload', file);
  e.target.value = '';
}
</script>
