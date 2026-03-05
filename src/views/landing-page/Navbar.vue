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
    <nav class="landing-navbar d-flex align-center justify-space-between transition-all"
        :class="{ 'navbar-scrolled': isScrolled }">
        <div class="d-flex align-center gap-2 px-6 px-md-12">
            <div class="logo-container">
                <img v-if="data?.image_url" :src="data.image_url" style="width: 32px; height: 32px; object-fit: contain;" />
                <VIcon v-else :icon="data?.subtitle || 'ri-nurse-fill'" color="primary" size="32" />
            </div>
            <span class="logo-text text-h5 font-weight-black text-primary">{{ data?.title || 'Vet&Pet' }}</span>
        </div>

        <div class="d-flex gap-4 align-center px-6 px-md-12">
            <VBtn variant="text" color="secondary" href="/cliente/login" class="text-none font-weight-medium">
                Portal Cliente
            </VBtn>
            <VBtn color="primary" rounded="pill" href="/cliente/register" elevation="0"
                class="text-none font-weight-bold px-6 border-glow">
                Registrarse
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
