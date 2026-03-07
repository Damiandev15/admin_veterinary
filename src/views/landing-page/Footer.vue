<script setup>
defineProps({ data: Object })
</script>

<template>
  <footer
    class="pa-6 pa-md-10 border-t"
    style="background: linear-gradient(to right, #260D2E, #3D154A); border-top-color: rgba(255,255,255,0.1) !important;"
  >
    <VRow class="max-w-1200 mx-auto align-center justify-space-between">
      <VCol
        cols="12"
        sm="auto"
        class="text-center text-sm-left mb-6 mb-sm-0"
      >
        <div class="d-flex align-center justify-center justify-sm-start gap-3">
          <div
            class="footer-logo-box pa-2 rounded-lg"
            style="background: rgba(255,255,255,0.1);"
          >
            <img
              v-if="data?.image_url"
              :src="data.image_url"
              style="width: 28px; height: 28px; object-fit: contain;"
            >
            <VIcon
              v-else
              :icon="data?.subtitle || 'ri-nurse-fill'"
              size="28"
              color="white"
            />
          </div>
          <span class="text-h5 font-weight-black text-white">{{ data?.title || 'Vet&Pet 🐾' }}</span>
        </div>
      </VCol>

      <VCol
        cols="12"
        sm="auto"
        class="text-center mb-6 mb-sm-0"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="text-body-1 font-weight-medium"
          style="color: rgba(255,255,255,0.85);"
          v-html="data?.description || '&copy; 2026 Admin Veterinaria.'"
        />
        <!-- eslint-enable vue/no-v-html -->
        <div class="d-block d-md-inline ms-0 ms-md-2 mt-1 mt-md-0 text-white opacity-80 text-caption text-md-body-1">
          {{ data?.subtitle || 'Diseñamos salud con amor.' }}
        </div>
      </VCol>

      <VCol
        cols="12"
        sm="auto"
        class="text-center text-sm-right"
      >
        <div class="d-flex gap-4 gap-sm-6 justify-center justify-sm-end">
          <VBtn
            icon="ri-facebook-circle-fill"
            variant="text"
            color="white"
            size="small"
          />
          <VBtn
            icon="ri-instagram-line"
            variant="text"
            color="white"
            size="small"
          />
          <VBtn
            icon="ri-twitter-x-fill"
            variant="text"
            color="white"
            size="small"
          />
        </div>
      </VCol>
    </VRow>
  </footer>
</template>

<style scoped>
.max-w-1200 {
  max-width: 1200px;
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}
</style>
