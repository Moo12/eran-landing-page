<template>
  <AdminLayout>
    <div class="p-6">
      <h1 class="text-xl font-semibold text-white mb-1">הגדרות אתר</h1>
      <p class="text-sm mb-6" style="color:#5a6880">ניהול תמונות הרקע של האתר</p>

      <!-- Slot tabs -->
      <div class="flex gap-2 mb-6 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.slot"
          @click="activeSlot = tab.slot"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :style="activeSlot === tab.slot
            ? 'background:#b8964e;color:#1e2530'
            : 'background:rgba(255,255,255,0.05);color:#8a9ab0'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Active slot — full width -->
      <ImageSlotManager
        v-for="tab in tabs"
        v-show="activeSlot === tab.slot"
        :key="tab.slot"
        :slot="tab.slot"
        :title="tab.label"
        :subtitle="tab.subtitle"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import AdminLayout from '../components/AdminLayout.vue';
import ImageSlotManager from '../components/ImageSlotManager.vue';

const tabs = [
  { slot: 'hero_image',  label: 'תמונה ראשית', subtitle: 'תמונת הרקע של קטע הכותרת' },
  { slot: 'about_image', label: 'תמונה אודותי', subtitle: "הצילום בקטע 'אודותי'" },
];

const activeSlot = ref('hero_image');
</script>
