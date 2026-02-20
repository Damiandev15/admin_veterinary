<script setup>
import { onMounted, ref } from 'vue'
import { isPermission } from '@/utils/constants'
import illustration1 from '@images/cards/illustration-1.png'
import illustration2 from '@images/cards/illustration-2.png'

const statisticsWithImages = ref([])

definePage({
  meta: {
    permisssion: 'all',
  },
})

const veterinarieNetIncome = async () => {
  try {
    const resp = await $api('/kpi_veterinarie_net_income', {
      method: 'POST',
      body: {},
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(resp)

    // Validar que veterinarie_most_net_income no sea null
    if (resp.veterinarie_most_net_income) {
      statisticsWithImages.value.push({
        title: 'V. + Ingreso neto',
        subtitle: resp.veterinarie_most_net_income.full_name,
        stats: `${resp.veterinarie_most_net_income.net_income_total} BS`,
        change: resp.variation_percentage,
        image: resp.veterinarie_most_net_income.gender === 'M' ? illustration1 : illustration2,
        imgWidth: 99,
        color: 'primary',
      })
    }
    else {
      statisticsWithImages.value.push({
        title: 'V. + Ingreso neto',
        subtitle: 'Sin datos',
        stats: '0 BS',
        change: 0,
        image: illustration1,
        imgWidth: 99,
        color: 'primary',
      })
    }
  }
  catch (error) {
    console.log(error)
  }
}

const veterinarieServicesAsigned = async () => {
  try {
    const resp = await $api('/kpi_veterinarie_most_asigned', {
      method: 'POST',
      body: {},
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(resp)

    // Validar que veterinarie_most_asigned no sea null
    if (resp.veterinarie_most_asigned) {
      statisticsWithImages.value.push({
        title: 'V. + Servicios asignado',
        subtitle: resp.veterinarie_most_asigned.full_name,
        stats: `${resp.veterinarie_most_asigned.n_asigned}`,
        change: resp.variation_percentage,
        image: resp.veterinarie_most_asigned.gender === 'M' ? illustration1 : illustration2,
        imgWidth: 99,
        color: 'primary',
      })
    }
    else {
      statisticsWithImages.value.push({
        title: 'V. + Servicios asignado',
        subtitle: 'Sin datos',
        stats: '0',
        change: 0,
        image: illustration1,
        imgWidth: 99,
        color: 'primary',
      })
    }
  }
  catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await veterinarieNetIncome()
  await veterinarieServicesAsigned()
})
</script>

<template>
  <div>
    <VRow
      v-if="isPermission('show_report_grafics')"
      class="match-height"
    >
      <!-- 👉 Sales Overview -->
      <VCol
        cols="12"
        md="6"
      >
        <EcommerceSalesOverview />
      </VCol>

      <!-- 👉 Images Cards -->
      <VCol
        v-for="statistics in statisticsWithImages"
        :key="statistics.title"
        cols="12"
        sm="6"
        md="3"
      >
        <CardStatisticsWithImages v-bind="statistics" />
      </VCol>

      <!-- 👉 Total Visits -->
      <VCol
        cols="12"
        md="3"
        sm="6"
      >
        <EcommerceTotalVisits />
      </VCol>

      <!-- 👉 Weekly Sales -->
      <VCol
        cols="12"
        md="6"
      >
        <EcommerceWeeklySalesBg />
      </VCol>

      <VCol
        cols="12"
        md="3"
        sm="6"
      >
        <CrmCongratulationsNorris />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <LogisticsShipmentStatistics />
      </VCol>

      <!-- 👉 Weekly Sales -->
      <VCol
        cols="12"
        md="6"
      >
        <AnalyticsWeeklySales />
      </VCol>
    </VRow>

    <VRow
      v-if="!isPermission('show_report_grafics')"
      class="match-height d-flex justify-center"
    >
      <VCol cols="6">
        <VImg
          src="https://cdn-icons-png.flaticon.com/512/8644/8644515.png"
          alt="No permission"
        />
      </VCol>
    </VRow>
  </div>
</template>