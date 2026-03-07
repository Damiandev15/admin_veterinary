<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'

defineProps({ data: Object })

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="landing-navbar d-flex align-center justify-space-between transition-all"
    :class="{ 'navbar-scrolled': isScrolled }"
  >
    <div class="d-flex align-center gap-2 px-4 px-md-12">
      <div class="logo-container pa-1 pa-sm-2">
        <img
          v-if="data?.image_url"
          :src="data.image_url"
          class="nav-img"
        >
        <VIcon
          v-else
          :icon="data?.subtitle || 'ri-nurse-fill'"
          color="primary"
          class="nav-icon"
        />
      </div>
      <span class="logo-text text-subtitle-1 text-sm-h5 font-weight-black text-primary">{{ data?.title || 'Vet&Pet' }}</span>
    </div>

    <div class="d-flex gap-2 gap-sm-4 align-center px-4 px-md-12">
      <VBtn
        variant="text"
        color="secondary"
        href="/cliente/login"
        class="text-none font-weight-medium px-2 px-sm-4"
      >
        <span class="d-none d-sm-inline">Portal Cliente</span>
        <span class="d-inline d-sm-none">Portal</span>
      </VBtn>
      <VBtn
        color="primary"
        rounded="pill"
        href="/cliente/register"
        elevation="0"
        class="text-none font-weight-bold px-4 px-sm-6 border-glow"
      >
        <span class="d-none d-sm-inline">Registrarse</span>
        <span class="d-inline d-sm-none">Registro</span>
      </VBtn>
    </div>
  </nav>
</template>

<style scoped>
.landing-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: transparent;
    height: 80px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-scrolled {
    background: rgba(var(--v-theme-surface), 0.8) !important;
    backdrop-filter: blur(12px) saturate(180%);
    height: 70px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.logo-text {
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #666cff, #a56eff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.logo-container {
    padding: 8px;
    background: rgba(var(--v-theme-primary), 0.1);
    border-radius: 12px;
    display: flex;
}

.nav-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}

.nav-icon {
    font-size: 32px;
}

@media (max-width: 600px) {
    .nav-img {
        width: 24px;
        height: 24px;
    }
    .nav-icon {
        font-size: 24px;
    }
    .logo-container {
        padding: 6px;
    }
}

.transition-all {
    transition: all 0.3s ease;
}

.border-glow {
    box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.3);
}

.border-glow:hover {
    box-shadow: 0 0 25px rgba(var(--v-theme-primary), 0.5);
    transform: translateY(-1px);
}
</style>
