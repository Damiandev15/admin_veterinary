<script setup>
const statistics = ref([])
import { formatCurrency } from '@/utils/currencyFormatter'

const report_general = ref({
  n_pets: 0,
  n_service_record: 0,
  net_income_total_bs: 0,
  net_income_total_usd: 0,
  net_income_total_consolidated: 0,
  net_income_total: 0,
  net_income_total_before: 0,
  variation_percentage: 0,
  exchange_rate: 1,
})

const reportGeneral = async () => {
  try {

    const resp = await $api('/kpi_report_general', {
      method: 'POST',
      body: {},
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(resp)
    report_general.value.n_pets = resp.n_pets
    report_general.value.n_service_record = resp.n_service_record
    report_general.value.net_income_total_bs = resp.net_income_total_bs
    report_general.value.net_income_total_usd = resp.net_income_total_usd
    report_general.value.net_income_total_consolidated = resp.net_income_total_consolidated
    report_general.value.net_income_total = resp.net_income_total
    report_general.value.net_income_total_before = resp.net_income_total_before
    report_general.value.variation_percentage = resp.variation_percentage
    report_general.value.exchange_rate = resp.exchange_rate
    statistics.value = [
      {
        title: 'N° Mascotas',
        stats: report_general.value.n_pets,
        icon: 'ri-user-star-line',
        color: 'primary',
      },
      {
        title: 'Ingresos Totales (BS)',
        stats: formatCurrency(report_general.value.net_income_total_consolidated, 'efectivo'),
        icon: 'ri-money-dollar-circle-line',
        color: 'warning',
      },
      {
        title: 'Ingresos Divisas (BS)',
        stats: formatCurrency(report_general.value.net_income_total_usd * report_general.value.exchange_rate, 'efectivo'),
        icon: 'ri-bank-card-line',
        color: 'success',
      },
      {
        title: 'Total Consolidado ($)',
        stats: formatCurrency(report_general.value.net_income_total_consolidated / (report_general.value.exchange_rate || 1), 'zelle'),
        icon: 'ri-wallet-line',
        color: 'info',
      },
    ]
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  reportGeneral()
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Reporte General</VCardTitle>
      <VCardSubtitle class="d-flex align-center gap-x-2">
        Ingreso consolidado (Tasa: {{ report_general.exchange_rate }} BS/$)
        <div
          v-if="report_general.variation_percentage >= 0"
          class="d-flex align-center text-success font-weight-medium"
        >
          +{{ report_general.variation_percentage }}%
          <VIcon
            icon="ri-arrow-up-s-line"
            size="20"
          />
        </div>
        <div
          v-if="report_general.variation_percentage < 0"
          class="d-flex align-center text-error font-weight-medium"
        >
          {{ report_general.variation_percentage }}%
          <VIcon
            icon="ri-arrow-down-s-line"
            size="20"
          />
        </div>
      </VCardSubtitle>
      <!--
        <template #append>
        <div class="mt-n7 me-n3">
        <MoreBtn :menu-list="moreList" />
        </div>
        </template> 
      -->
    </VCardItem>

    <VCardText>
      <div class="d-flex justify-space-between flex-column flex-sm-row gap-4 flex-wrap">
        <div
          v-for="item in statistics"
          :key="item.title"
          class="d-flex align-center"
        >
          <VAvatar
            :color="item.color"
            rounded
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon
              size="24"
              :icon="item.icon"
            />
          </VAvatar>

          <div class="d-flex flex-column">
            <h5 class="text-h5">
              {{ item.stats }}
            </h5>
            <div class="text-body-1">
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
