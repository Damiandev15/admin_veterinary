<script setup>
import { onMounted, ref } from 'vue'

const petMostPaymentSelected = ref({
  variationPercentage: 0,
  paymentsTotalBefore: 0,
  petMostPayments: {
    name: '',
    paymentTotals: 0,
    petId: 0,
  },
})

const PetMostPayments = async () => {
  try {
    const resp = await $api('/kpi_pets_most_payments', {
      method: 'POST',
      body: {},
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(resp)

    petMostPaymentSelected.value.variationPercentage = resp.VPPets
    petMostPaymentSelected.value.paymentsTotalBefore = resp.payments_total_before

    // Validar que pet_most_payments no sea null
    if (resp.pet_most_payments) {
      petMostPaymentSelected.value.petMostPayments = {
        name: resp.pet_most_payments.name,
        paymentTotals: resp.pet_most_payments.payment_totals,
        petId: resp.pet_most_payments.pet_id,
      }
    }
    else {
      // Mantener valores por defecto cuando no hay datos
      petMostPaymentSelected.value.petMostPayments = {
        name: 'Sin datos',
        paymentTotals: 0,
        petId: 0,
      }
    }
  }
  catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  PetMostPayments()
})
</script>

<template>
  <VCard class="position-relative">
    <VCardText>
      <div class="mb-3">
        <h5 class="text-h5 text-wrap">
          <strong>{{ petMostPaymentSelected.petMostPayments.name }}!</strong>
          <span class="text-high-emphasis">
            🎉
          </span>
        </h5>
        <div class="text-subtitle-1">
          Mascota con mas gastos en nuestros servicios
        </div>
      </div>

      <h4 class="text-h4 text-primary">
        {{ petMostPaymentSelected.petMostPayments.paymentTotals }} BS
      </h4>

      Mes anterior ({{ petMostPaymentSelected.paymentsTotalBefore }} BS)

      <VCardSubtitle class="d-flex align-center gap-x-2 px-0">
        <div
          v-if="petMostPaymentSelected.variationPercentage >= 0"
          class="d-flex align-center text-success font-weight-medium"
        >
          +{{ petMostPaymentSelected.variationPercentage }}%
          <VIcon
            icon="ri-arrow-up-s-line"
            size="20"
          />
        </div>
        <div
          v-if="petMostPaymentSelected.variationPercentage < 0"
          class="d-flex align-center text-error font-weight-medium"
        >
          {{ petMostPaymentSelected.variationPercentage }}%
          <VIcon
            icon="ri-arrow-down-s-line"
            size="20"
          />
        </div>
      </VCardSubtitle>
    </VCardText>

    <!-- Trophy -->
    <VImg
      src="https://cdn-icons-png.flaticon.com/256/437/437493.png"
      class="trophy flip-in-rtl"
    />
  </VCard>
</template>

<style lang="scss">
.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 6.625rem;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>
