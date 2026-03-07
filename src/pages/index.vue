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

const heroData = computed(() => sections.value.find(s => s.section_key === 'hero'))
const ctaData = computed(() => sections.value.find(s => s.section_key === 'cta'))
const footerData = computed(() => sections.value.find(s => s.section_key === 'footer'))
const navbarData = computed(() => sections.value.find(s => s.section_key === 'navbar'))

const featuresData = computed(() => {
  const feats = sections.value.filter(s => s.section_key.startsWith('feature')).sort((a, b) => a.order - b.order)
  if (!feats.length) return undefined
  const colors = ['primary', 'success', 'error', 'info']

  return feats.map((s, index) => ({
    title: s.title,
    description: s.description,
    icon: s.subtitle || 'ri-star-line',
    color: colors[index % colors.length],
    image: s.image_url,
  }))
})

onMounted(() => {
  fetchLandingData()
})
</script>

<template>
  <div class="landing-page-root">
    <Navbar :data="navbarData" />

    <main>
      <article>
        <!-- Standard sections, no more hidden containers -->
        <Hero :data="heroData" />

        <section id="servicios">
          <Features :features="featuresData" />
        </section>

        <section class="cta-section text-center text-white position-relative overflow-hidden responsive-cta">
          <!-- CTA Background Image (Optional) -->
          <div
            v-if="ctaData?.image_url"
            class="position-absolute w-100 h-100"
            style="top: 0; left: 0; z-index: 0;"
          >
            <img
              :src="ctaData.image_url"
              style="width: 100%; height: 100%; object-fit: cover; opacity: 0.2;"
            >
          </div>

          <div
            class="max-w-900 mx-auto px-6 position-relative"
            style="z-index: 1;"
          >
            >
            <!-- eslint-disable vue/no-v-html -->
            <h2
              class="text-h2 font-weight-black mb-10"
              v-html="ctaData?.title || `Tu Mascota se Sentir\u00e1 <br class='d-none d-md-block' /> como en Casa`"
            />
            <!-- eslint-enable vue/no-v-html -->
            <p class="text-h5 mb-12 opacity-80 font-weight-light">
              {{ ctaData?.description || 'Únete a las miles de familias que confían en nuestra atención especializada y humana.' }}
            </p>
            <div
              class="animate-up"
              style="transition-delay: 0.3s"
            >
              <VBtn
                size="x-large"
                color="white"
                rounded="pill"
                href="/cliente/register"
                class="cta-main-btn font-weight-black px-6 px-md-12 h-auto py-4 py-md-6"
                elevation="20"
              >
                REGISTRAR MI MASCOTA
              </VBtn>
            </div>
          </div>
        </section>
      </article>
    </main>

    <Footer :data="footerData" />
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

.responsive-cta {
  min-height: 500px;
  display: flex;
  align-items: center;
  padding: 4rem 1rem;
}

@media (max-width: 960px) {
  .text-h2 {
    font-size: 2.5rem !important;
  }

  .responsive-cta {
    min-height: 400px;
  }
}

@media (max-width: 600px) {
  .text-h2 {
    font-size: 2rem !important;
  }

  .cta-main-btn {
    font-size: 1rem !important;
    width: 100%;
    margin-top: 1rem;
  }

  .responsive-cta {
    min-height: 350px;
  }
}
</style>
