<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted, watch } from 'vue';

const loading = ref(false);
const syncLoading = ref(false);
const saving = ref(false);

const exchangeData = ref({
    rate: 0,
    last_updated: '',
});

// Calculadora
const amountUSD = ref(0);
const amountBS = ref(0);
const isUpdating = ref(false);

const loadExchangeData = async () => {
    loading.value = true;
    try {
        const resp = await $api('/settings/exchange-rate', {
            method: 'GET',
        });
        exchangeData.value = resp;
        // Inicializar calculadora con 1 USD
        amountUSD.value = 1;
        amountBS.value = parseFloat((1 * resp.rate).toFixed(2));
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const syncNow = async () => {
    syncLoading.value = true;
    try {
        const resp = await $api('/settings/exchange-rate/sync', {
            method: 'POST',
        });

        if (resp.success) {
            exchangeData.value.rate = resp.rate;
            exchangeData.value.last_updated = resp.last_updated;
            updateBS(); // Actualizar calculadora

            Swal.fire({
                icon: 'success',
                title: 'Sincronizado',
                text: 'Tasa actualizada desde BCV (DolarApi)',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo conectar con el servicio de tasas.',
        });
    } finally {
        syncLoading.value = false;
    }
};

const saveManual = async () => {
    const { value: newRate } = await Swal.fire({
        title: 'Actualización Manual',
        input: 'number',
        inputLabel: 'Ingrese la nueva tasa (BS/$)',
        inputValue: exchangeData.value.rate,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return 'Por favor ingrese una tasa válida mayor a 0';
            }
        }
    });

    if (newRate) {
        saving.value = true;
        try {
            const resp = await $api('/settings/exchange-rate/manual', {
                method: 'POST',
                body: JSON.stringify({ rate: newRate }),
                headers: { 'Content-Type': 'application/json' },
            });

            exchangeData.value.rate = resp.rate;
            exchangeData.value.last_updated = 'Manual (' + new Date().toLocaleString() + ')';
            updateBS();

            Swal.fire('¡Éxito!', 'Tasa actualizada manualmente.', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar la tasa.', 'error');
        } finally {
            saving.value = false;
        }
    }
};

// Lógica de Calculadora
const updateBS = () => {
    if (isUpdating.value) return;
    isUpdating.value = true;
    amountBS.value = parseFloat((amountUSD.value * exchangeData.value.rate).toFixed(2));
    setTimeout(() => { isUpdating.value = false; }, 50);
};

const updateUSD = () => {
    if (isUpdating.value) return;
    isUpdating.value = true;
    amountUSD.value = parseFloat((amountBS.value / exchangeData.value.rate).toFixed(2));
    setTimeout(() => { isUpdating.value = false; }, 50);
};

onMounted(() => {
    loadExchangeData();
});
</script>

<template>
    <VRow>
        <!-- Tarjeta A: Monitor BCV -->
        <VCol cols="12" md="5">
            <VCard class="h-100 overflow-hidden">
                <div class="d-flex flex-column h-100">
                    <VCardItem class="pb-2">
                        <template #prepend>
                            <VAvatar color="primary" variant="tonal" rounded size="40">
                                <VIcon icon="ri-bank-line" />
                            </VAvatar>
                        </template>
                        <VCardTitle>Monitor BCV</VCardTitle>
                        <VCardSubtitle>Fuente: DolarApi (Oficial)</VCardSubtitle>
                    </VCardItem>

                    <VCardText class="flex-grow-1 d-flex flex-column justify-center align-center py-8">
                        <div class="text-overline mb-1">TASA ACTUAL</div>
                        <h1 class="text-h2 font-weight-bold primary--text mb-2">
                            <VProgressCircular v-if="loading" indeterminate size="40" />
                            <span v-else>Bs. {{ exchangeData.rate.toLocaleString('es-VE', { minimumFractionDigits: 2 })
                            }}</span>
                        </h1>
                        <div class="text-caption d-flex align-center gap-1">
                            <VIcon icon="ri-time-line" size="14" />
                            {{ exchangeData.last_updated || 'Sin datos' }}
                        </div>
                    </VCardText>

                    <VDivider />

                    <VCardText class="pa-4 bg-var-theme-background">
                        <div class="d-flex gap-2">
                            <VBtn block color="primary" variant="elevated" :loading="syncLoading" @click="syncNow">
                                <VIcon icon="ri-refresh-line" start />
                                Sincronizar Ahora
                            </VBtn>
                            <VBtn icon="ri-edit-line" variant="tonal" color="secondary" @click="saveManual"
                                title="Ajuste Manual" />
                        </div>
                    </VCardText>
                </div>
            </VCard>
        </VCol>

        <!-- Tarjeta B: Calculadora Bidireccional -->
        <VCol cols="12" md="7">
            <VCard class="h-100">
                <VCardItem>
                    <template #prepend>
                        <VAvatar color="success" variant="tonal" rounded size="40">
                            <VIcon icon="ri-calculator-line" />
                        </VAvatar>
                    </template>
                    <VCardTitle>Calculadora de Conversión</VCardTitle>
                </VCardItem>
                <VCardText>
                    <p class="mb-8">Use esta herramienta para convertir montos rápidamente usando la tasa oficial
                        actual.</p>

                    <VRow align="center">
                        <VCol cols="12" sm="5">
                            <VTextField v-model.number="amountUSD" label="Dólares ($)" type="number" prefix="$"
                                variant="outlined" @input="updateBS" placeholder="0.00" hide-details />
                        </VCol>

                        <VCol cols="12" sm="2" class="text-center">
                            <VIcon icon="ri-arrow-left-right-line" size="24" color="primary"
                                class="d-none d-sm-inline-block" />
                            <VIcon icon="ri-arrow-up-down-line" size="24" color="primary"
                                class="d-inline-block d-sm-none" />
                        </VCol>

                        <VCol cols="12" sm="5">
                            <VTextField v-model.number="amountBS" label="Bolívares (Bs)" type="number" prefix="Bs"
                                variant="outlined" @input="updateUSD" placeholder="0.00" hide-details />
                        </VCol>
                    </VRow>

                    <div
                        class="mt-8 pa-4 rounded bg-light-primary border-primary border-dashed d-flex align-center gap-4">
                        <VAvatar color="primary" size="48" variant="tonal">
                            <VIcon icon="ri-information-line" />
                        </VAvatar>
                        <div>
                            <div class="text-subtitle-1 font-weight-bold">Información de Conversión</div>
                            <p class="text-caption mb-0">1.00 USD equivale a <strong>{{ exchangeData.rate }}
                                    BS</strong>. Esta
                                calculadora utiliza el redondeo estándar de dos decimales.</p>
                        </div>
                    </div>
                </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>

<style scoped>
.bg-light-primary {
    background-color: rgba(var(--v-theme-primary), 0.05);
}

.border-dashed {
    border-style: dashed !important;
    border-width: 1px !important;
}
</style>
