<template>
  <Teleport to="body">
    <div
      ref="el"
      class="fixed inset-0 z-50 flex flex-col outline-none select-none"
      style="background:rgba(0,0,0,0.94)"
      tabindex="-1"
      @keydown="onKey"
    >
      <!-- ── Top bar ── -->
      <div class="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-sm tabular-nums" style="color:#5a6880">
            {{ idx + 1 }} / {{ items.length }}
          </span>
          <span
            class="text-xs px-2.5 py-1 rounded-full font-mono"
            style="background:rgba(184,150,78,0.15);color:#b8964e"
          >
            {{ current.category }}
          </span>
        </div>
        <button
          @click="requestClose"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-xl leading-none transition-colors"
          style="color:#5a6880"
          onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.07)'"
          onmouseout="this.style.color='#5a6880';this.style.background='transparent'"
        >×</button>
      </div>

      <!-- ── Image area ── -->
      <div class="flex-1 flex items-center min-h-0 gap-2 px-2">
        <!-- Prev -->
        <button
          @click="go(idx - 1)"
          :disabled="idx === 0"
          class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl transition-all"
          :style="idx === 0
            ? 'opacity:0.15;cursor:default;color:#fff'
            : 'color:#fff;background:rgba(255,255,255,0.07)'"
        >‹</button>

        <!-- Image -->
        <div class="flex-1 h-full flex items-center justify-center p-4 min-w-0">
          <img
            :key="current.src"
            :src="'/' + current.src"
            :alt="current.label"
            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            style="transition:opacity 0.15s"
          />
        </div>

        <!-- Next -->
        <button
          @click="go(idx + 1)"
          :disabled="idx === items.length - 1"
          class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl transition-all"
          :style="idx === items.length - 1
            ? 'opacity:0.15;cursor:default;color:#fff'
            : 'color:#fff;background:rgba(255,255,255,0.07)'"
        >›</button>
      </div>

      <!-- ── Bottom action bar ── -->
      <div class="flex-shrink-0 border-t border-white/5 px-6 py-5" style="background:rgba(30,37,48,0.95)">
        <div class="max-w-2xl mx-auto">
          <div class="flex items-end gap-3">
            <!-- Label -->
            <div class="flex-1">
              <label class="block text-xs mb-1.5" style="color:#5a6880">Label</label>
              <input
                v-model="form.label"
                type="text"
                dir="rtl"
                class="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
                @focus="e => e.target.style.borderColor='#b8964e'"
                @blur="e => e.target.style.borderColor='rgba(255,255,255,0.1)'"
              />
            </div>

            <!-- Category -->
            <div class="w-44 flex-shrink-0">
              <label class="block text-xs mb-1.5" style="color:#5a6880">Category</label>
              <select
                v-model="form.category"
                class="w-full rounded-lg px-3 py-2.5 text-white text-sm outline-none border"
                style="background:#3a4555;border-color:rgba(255,255,255,0.1)"
              >
                <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <!-- Save -->
            <button
              @click="save"
              :disabled="saving || !isDirty"
              class="flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
              :style="isDirty && !saving
                ? 'background:#b8964e;color:#1e2530'
                : 'background:rgba(184,150,78,0.15);color:#b8964e;opacity:0.4;cursor:default'"
            >
              {{ saving ? '...' : 'Save' }}
            </button>

            <!-- Delete -->
            <button
              @click="del"
              class="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style="background:rgba(239,68,68,0.12);color:#f87171"
              onmouseover="this.style.background='rgba(239,68,68,0.22)'"
              onmouseout="this.style.background='rgba(239,68,68,0.12)'"
            >Delete</button>
          </div>

          <p v-if="saveError" class="text-red-400 text-xs mt-2">{{ saveError }}</p>
          <p v-if="saveOk" class="text-green-400 text-xs mt-2">Saved ✓</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  initialIndex: { type: Number, default: 0 },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'update', 'delete']);

const el = ref(null);
const idx = ref(props.initialIndex);
const saving = ref(false);
const saveError = ref('');
const saveOk = ref(false);

const form = ref({ label: '', category: '' });

const current = computed(() => props.items[idx.value] || {});

const isDirty = computed(
  () => form.value.label !== current.value.label || form.value.category !== current.value.category
);

function syncForm() {
  form.value = { label: current.value.label || '', category: current.value.category || '' };
  saveError.value = '';
  saveOk.value = false;
}

watch(() => idx.value, syncForm);
watch(() => props.items[idx.value], syncForm, { deep: true });

function go(newIdx) {
  if (newIdx < 0 || newIdx >= props.items.length) return;
  if (isDirty.value) {
    if (!confirm('You have unsaved changes. Discard and continue?')) return;
  }
  idx.value = newIdx;
}

function prev() { go(idx.value - 1); }
function next() { go(idx.value + 1); }

function requestClose() {
  if (isDirty.value && !confirm('You have unsaved changes. Close anyway?')) return;
  emit('close');
}

function onKey(e) {
  if (e.key === 'ArrowLeft')  prev();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'Escape')     requestClose();
}

async function save() {
  if (!isDirty.value) return;
  saving.value = true;
  saveError.value = '';
  saveOk.value = false;
  try {
    await emit('update', current.value.id, { ...form.value });
    saveOk.value = true;
    setTimeout(() => { saveOk.value = false; }, 2000);
  } catch (e) {
    saveError.value = e?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
}

async function del() {
  if (!confirm(`Delete "${current.value.label}"?`)) return;
  emit('delete', current.value.id);
}

onMounted(() => {
  syncForm();
  nextTick(() => el.value?.focus());
});
</script>
