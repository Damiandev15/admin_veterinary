<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => null,
  },
})

const title = computed(() => props.data?.title || 'El Cuidado que tu Mascota Merece')
const description = computed(() => props.data?.description || 'En Vet&Pet nos apasiona ver a tu compañero sano y feliz. Contamos con tecnología de punta y un equipo humano dedicado a brindarle la mejor atención médica y estética.')
const imageUrl = computed(() => props.data?.image_url || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200')

const benefits = computed(() => {
  if (props.data?.subtitle && props.data.subtitle.trim() !== '') {
    return props.data.subtitle.split(',').map(s => s.trim()).filter(Boolean)
  }
  
  return [
    'Atención Médica Especializada',
    'Peluquería Canina de Alto Nivel',
    'Recordatorios de Vacunación',
    'Resultados de Exámenes Online',
  ]
})
</script>

<template>
  <section class="hero-section pa-6 pa-md-10 overflow-hidden position-relative pt-12">
    <VRow align="center">
      <VCol
        cols="12"
        md="7"
      >
        <div class="animate-up">
          <VChip
            variant="tonal"
            color="primary"
            class="mb-4"
            density="comfortable"
          >
            <VIcon
              icon="ri-heart-pulse-fill"
              size="14"
              class="me-2"
            />
            <span>Tu Mascota en las Mejores Manos</span>
          </VChip>
        </div>

        <h1 class="text-h1 font-weight-black mb-4 animate-up">
          {{ title }}
        </h1>

        <p
          class="text-h6 text-secondary mb-6 opacity-90 line-height-relaxed animate-up"
          style="animation-delay: 0.1s"
        >
          {{ description }}
        </p>

        <div
          class="advantages-list mb-8 animate-up"
          style="animation-delay: 0.2s"
        >
          <div
            v-for="adv in benefits"
            :key="adv"
            class="d-flex align-center gap-2 mb-2"
          >
            <VIcon
              icon="ri-check-line"
              color="success"
              size="20"
            />
            <span class="text-body-1 font-weight-medium text-high-emphasis">{{ adv }}</span>
          </div>
        </div>

        <div
          class="d-flex flex-wrap gap-4 animate-up"
          style="animation-delay: 0.3s"
        >
          <VBtn
            size="x-large"
            color="primary"
            rounded="xl"
            href="/cliente/register"
            elevation="4"
            class="px-8 font-weight-bold hero-btn"
          >
            Agendar una Cita
          </VBtn>

          <VBtn
            size="x-large"
            variant="outlined"
            color="primary"
            rounded="xl"
            class="px-8 font-weight-medium hero-btn"
          >
            Ver Servicios
          </VBtn>
        </div>
      </VCol>

      <VCol
        cols="12"
        md="5"
        class="d-flex justify-center mt-12 mt-md-0"
      >
        <div class="image-wrapper">
          <!-- Decorative Background Elements -->
          <div class="image-bg-glow" />
          <div class="image-dots" />

          <!-- Professional Floating Badge -->
          <div class="floating-badge d-flex align-center gap-2 pa-3">
            <div class="badge-icon">
              <VIcon
                icon="ri-shield-check-fill"
                color="primary"
                size="20"
              />
            </div>
            <div class="d-flex flex-column">
              <span class="text-caption font-weight-bold line-height-1">Certificado</span>
              <span class="text-tiny opacity-70">Salud Protegida</span>
            </div>
          </div>

          <!-- Main Image -->
          <VImg
            :src="imageUrl"
            class="hero-main-img"
            cover
            alt="Cuidado profesional de mascotas"
          />
        </div>
      </VCol>
    </VRow>
  </section>
</template>

<style scoped>
.hero-section {
    background: radial-gradient(circle at 0% 0%, #4B1D5E 0%, #3D154A 100%);
    padding-top: 160px !important;
    min-height: 95vh;
}

.text-h1 {
    font-size: 4.5rem !important;
    line-height: 1;
    letter-spacing: -3px !important;
    background: linear-gradient(135deg, #FFFFFF 0%, #E0B0FF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.text-secondary {
    color: #E0B0FF !important;
    opacity: 1;
}

.line-height-relaxed {
    line-height: 1.6;
    max-width: 580px;
}

.image-wrapper {
    position: relative;
    width: 100%;
    max-width: 450px;
}

.hero-main-img {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: 40px;
    border: 1px solid rgba(var(--v-border-color), 0.1);
    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4);
    position: relative;
    z-index: 2;
    object-fit: cover;
}

.image-bg-glow {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 100%;
    height: 100%;
    background: var(--v-theme-primary);
    filter: blur(80px);
    opacity: 0.15;
    z-index: 0;
    border-radius: 50%;
}

.image-dots {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 100px;
    height: 100px;
    background-image: radial-gradient(rgba(var(--v-theme-primary), 0.2) 2px, transparent 2px);
    background-size: 15px 15px;
    z-index: 1;
}

.floating-badge {
    position: absolute;
    bottom: 30px;
    left: -20px;
    background: rgba(38, 13, 46, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10;
    animation: float 4s ease-in-out infinite;
}

.badge-icon {
    background: rgba(var(--v-theme-primary), 0.1);
    border-radius: 10px;
    padding: 6px;
}

.line-height-1 {
    line-height: 1;
}

.text-tiny {
    font-size: 0.65rem;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes morphing {
    0% {
        border-radius: 60% 40% 70% 30% / 40% 50% 60% 70%;
    }

    50% {
        border-radius: 30% 60% 40% 70% / 50% 40% 30% 60%;
    }

    100% {
        border-radius: 60% 40% 70% 30% / 40% 50% 60% 70%;
    }
}

@media (max-width: 960px) {
    .text-h1 {
        font-size: 2.8rem !important;
    }
    .hero-section {
        padding-top: 120px !important;
        min-height: auto;
        padding-bottom: 40px;
    }
}

@media (max-width: 600px) {
    .text-h1 {
        font-size: 2.2rem !important;
    }
    .hero-btn {
        width: 100%;
        margin-right: 0 !important;
    }
    .hero-section {
        padding-top: 100px !important;
    }
}

/* Simplified Animations that don't depend on JS and start visible */
.animate-up {
    animation: fadeInUp 0.8s ease-out forwards;
}

.animate-in {
    animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Ensure visibility if animations are disabled or fail */
* {
    opacity: 1;
}
</style>
