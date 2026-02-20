<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/views/landing-page/Navbar.vue'
import Hero from '@/views/landing-page/Hero.vue'
import Features from '@/views/landing-page/Features.vue'
import Footer from '@/views/landing-page/Footer.vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const sections = ref([])

const fetchLandingData = async () => {
  try {
    const resp = await $api('/landing-sections', { method: 'GET' })
    sections.value = resp.sections
  } catch (error) {
    console.error('Error fetching landing data:', error)
  }
}

const heroData = computed(() => {
  const section = sections.value.find(s => s.section_key === 'hero')
  return section ? section : undefined
})

const featuresData = computed(() => {
  return sections.value.filter(s => s.section_key.startsWith('feature'))
})

onMounted(() => {
  fetchLandingData()
})
</script>

<template>
  <div class="landing-page-root">
    <Navbar />

    <main>
      <article>
        <!-- Standard sections, no more hidden containers -->
        <Hero :data="heroData" />

        <section id="servicios">
          <Features :features="featuresData.length ? featuresData : undefined" />
        </section>

        <section class="cta-section py-48 text-center text-white"
          style="min-height: 500px; display: flex; align-items: center;">
          <div class="max-w-900 mx-auto px-6">
            <h2 class="text-h2 font-weight-black mb-10">
              Tu Mascota se Sentirá <br class="d-none d-md-block" /> como en Casa
            </h2>
            <p class="text-h5 mb-12 opacity-80 font-weight-light">
              Únete a las miles de familias que confían en nuestra atención especializada y humana.
            </p>
            <div class="animate-up" style="transition-delay: 0.3s">
              <VBtn size="x-large" color="white" rounded="pill" href="/cliente/register"
                class="cta-main-btn font-weight-black px-12 h-auto py-6" elevation="20">
                REGISTRAR MI MASCOTA
              </VBtn>
            </div>
          </div>
        </section>
      </article>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.landing-page-root {
  background: #3D154A;
  color: #FFFFFF;
  min-height: 100vh;
}

.max-w-900 {
  max-width: 900px;
}

.cta-main-btn {
  color: #7B2D8E !important;
  font-size: 1.2rem !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
}

.cta-main-btn:hover {
  transform: scale(1.05) translateY(-5px);
  background-color: #ffffff !important;
  box-shadow: 0 15px 50px rgba(255, 255, 255, 0.4) !important;
}

.cta-section {
  background: radial-gradient(circle at center, #7B2D8E 0%, #3D154A 100%) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 960px) {
  .text-h2 {
    font-size: 2.5rem !important;
  }
}
</style>
