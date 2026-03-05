<script setup>
defineProps({
    features: {
        default: () => [
            {
                title: 'Medicina Preventiva',
                description: 'Vacunación, desparasitación y chequeos generales para una vida larga y saludable.',
                icon: 'ri-shield-cross-line',
                color: 'primary'
            },
            {
                title: 'Peluquería & Spa',
                description: 'Estética profesional con productos premium para que tu mascota brille siempre.',
                icon: 'ri-scissors-cut-line',
                color: 'success'
            },
            {
                title: 'Atención 24 Horas',
                description: 'Estamos siempre listos para atender urgencias con el mejor equipo médico.',
                icon: 'ri-alarm-warning-line',
                color: 'error'
            },
            {
                title: 'Farmacia & Nutrición',
                description: 'Encuentra los medicamentos y el alimento balanceado ideal para sus necesidades.',
                icon: 'ri-capsule-line',
                color: 'info'
            }
        ]
    }
})
</script>

<template>
    <section class="features-section py-24 pa-6 pa-md-16 bg-surface">
        <div class="max-w-1200 mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-h2 font-weight-black mb-4">Nuestros Servicios</h2>
                <p class="text-h5 opacity-70 max-w-700 mx-auto font-weight-light">
                    Ofrecemos una atención integral pensando en la comodidad de tu mascota y tu tranquilidad.
                </p>
            </div>

            <VRow>
                <VCol v-for="(feat, idx) in (features || defaultFeatures)" :key="idx" cols="12" sm="6" md="3">
                    <VCard flat class="feature-card pa-10 rounded-xl h-100 border text-center">
                        <div class="icon-box-outer mb-8 mx-auto">
                            <div class="icon-box" :class="`text-${feat.color || 'primary'}`">
                                <VIcon :icon="feat.icon || 'ri-star-line'" size="42" />
                            </div>
                        </div>

                        <h3 class="text-h5 font-weight-bold mb-4">{{ feat.title }}</h3>
                        <p class="text-body-1 opacity-80 line-height-relaxed">{{ feat.description }}</p>
                    </VCard>
                </VCol>
            </VRow>
        </div>
    </section>
</template>

<style scoped>
.features-section {
    background: #3D154A;
}

.text-h2 {
    background: linear-gradient(135deg, #FFFFFF 0%, #E0B0FF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.max-w-1200 {
    max-width: 1200px;
}

.max-w-700 {
    max-width: 700px;
}

.line-height-relaxed {
    line-height: 1.6;
}

.feature-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #FFFFFF !important;
    backdrop-filter: blur(10px);
}

.feature-card:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(224, 176, 255, 0.4) !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2) !important;
}

.icon-box {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: rgba(var(--v-theme-surface), 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

@media (max-width: 960px) {
    .text-h2 {
        font-size: 2.2rem !important;
    }
}
</style>
