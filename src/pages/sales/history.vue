<script setup>
import Swal from 'sweetalert2'
import { ref, onMounted, computed } from 'vue'
import { formatCurrency } from '@/utils/currencyFormatter'

const sales = ref([])
const loading = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const paymentMethodFilter = ref('')
const selectedSale = ref(null)
const detailDialog = ref(false)

const paymentMethods = [
  { title: 'Efectivo', value: 'efectivo' },
  { title: 'Divisas', value: 'divisas' },
  { title: 'Transferencia', value: 'transferencia' },
  { title: 'Punto de Venta', value: 'punto_venta' },
  { title: 'Pago Móvil', value: 'pago_movil' },
  { title: 'Zelle', value: 'zelle' },
  { title: 'USDT', value: 'usdt' },
]

const filteredSales = computed(() => {
  let filtered = sales.value || []

  if (!Array.isArray(filtered)) {
    filtered = []
  }

  if (dateFrom.value) {
    filtered = filtered.filter(s => s.created_at >= dateFrom.value)
  }

  if (dateTo.value) {
    filtered = filtered.filter(s => s.created_at <= dateTo.value)
  }

  if (paymentMethodFilter.value) {
    filtered = filtered.filter(s => s.payment_method === paymentMethodFilter.value)
  }

  return filtered
})

const totalSalesBs = computed(() => {
  return filteredSales.value
    .filter(s => ['efectivo', 'transferencia', 'punto_venta', 'pago_movil'].includes(s.payment_method))
    .reduce((sum, sale) => sum + parseFloat(sale.total), 0)
})

const totalSalesUsd = computed(() => {
  return filteredSales.value
    .filter(s => ['divisas', 'zelle', 'usdt'].includes(s.payment_method))
    .reduce((sum, sale) => sum + parseFloat(sale.total), 0)
})

const loadSales = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (dateFrom.value) params.append('date_from', dateFrom.value)
    if (dateTo.value) params.append('date_to', dateTo.value)
    if (paymentMethodFilter.value) params.append('payment_method', paymentMethodFilter.value)

    const resp = await $api(`/sales?${params.toString()}`, {
      method: 'GET',
    })

    sales.value = resp.sales || resp.data || []
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cargar las ventas',
    })
  } finally {
    loading.value = false
  }
}

const viewDetails = async saleId => {
  try {
    const resp = await $api(`/sales/${saleId}`, {
      method: 'GET',
    })

    selectedSale.value = resp.sale
    detailDialog.value = true
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cargar los detalles de la venta',
    })
  }
}

const deleteSale = async id => {
  const result = await Swal.fire({
    title: '¿Está seguro?',
    text: "Esta acción eliminará la venta y restaurará el stock de los productos",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (result.isConfirmed) {
    try {
      await $api(`/sales/${id}`, {
        method: 'DELETE',
      })
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Venta eliminada y stock restaurado',
        showConfirmButton: false,
        timer: 1500,
      })
      loadSales()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar la venta',
      })
    }
  }
}

const getPaymentMethodLabel = method => {
  const found = paymentMethods.find(m => m.value === method)

  return found ? found.title : method
}

const getPaymentMethodColor = method => {
  const colors = {
    efectivo: 'success',
    divisas: 'success',
    transferencia: 'info',
    'punto_venta': 'warning',
    'pago_movil': 'primary',
    zelle: 'info',
    usdt: 'secondary',
  }

  return colors[method] || 'default'
}

const formatDate = dateString => {
  if (!dateString) return '-'
  const date = new Date(dateString)

  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadSales()
})

definePage({
  meta: {
    permission: 'all',
  },
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-space-between align-center mb-4">
          <h4 class="text-h4">
            📊 Historial de Ventas
          </h4>
          <VBtn
            color="primary"
            @click="loadSales"
          >
            <VIcon
              icon="ri-refresh-line"
              class="me-2"
            />
            Actualizar
          </VBtn>
        </div>

        <!-- Filtros -->
        <VRow class="mb-4">
          <VCol
            cols="12"
            md="3"
          >
            <label>Fecha Desde</label>
            <input
              v-model="dateFrom"
              type="date"
              class="v-field__input w-100 border p-2 rounded"
              @change="loadSales"
            >
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <label>Fecha Hasta</label>
            <input
              v-model="dateTo"
              type="date"
              class="v-field__input w-100 border p-2 rounded"
              @change="loadSales"
            >
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <VSelect
              v-model="paymentMethodFilter"
              :items="paymentMethods"
              label="Método de Pago"
              clearable
              @update:model-value="loadSales"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
            class="d-flex align-end"
          >
            <VCard
              variant="outlined"
              class="w-100 pa-2 d-flex flex-column gap-1"
            >
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Total Bs:</span>
                <span class="text-subtitle-2 font-weight-bold text-primary">
                  {{ formatCurrency(totalSalesBs, 'efectivo') }}
                </span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Total $:</span>
                <span class="text-subtitle-2 font-weight-bold text-success">
                  {{ formatCurrency(totalSalesUsd, 'zelle') }}
                </span>
              </div>
            </VCard>
          </VCol>
        </VRow>

        <!-- Tabla de Ventas -->
        <VTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Vendedor</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td
                colspan="7"
                class="text-center py-5"
              >
                <VProgressCircular
                  indeterminate
                  color="primary"
                />
              </td>
            </tr>
            <tr v-else-if="filteredSales.length === 0">
              <td
                colspan="7"
                class="text-center py-5"
              >
                No hay ventas registradas
              </td>
            </tr>
            <tr
              v-for="sale in filteredSales"
              v-else
              :key="sale.id"
            >
              <td>#{{ sale.id }}</td>
              <td>{{ formatDate(sale.created_at) }}</td>
              <td>{{ sale.user?.name || '-' }}</td>
              <td>{{ sale.client?.full_name || 'Cliente General' }}</td>
              <td class="font-weight-bold">
                {{ formatCurrency(sale.total, sale.payment_method) }}
              </td>
              <td>
                <VChip
                  :color="getPaymentMethodColor(sale.payment_method)"
                  size="small"
                >
                  {{ getPaymentMethodLabel(sale.payment_method) }}
                </VChip>
              </td>
              <td>
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  @click="viewDetails(sale.id)"
                >
                  <VIcon icon="ri-eye-line" />
                </VBtn>
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteSale(sale.id)"
                >
                  <VIcon icon="ri-delete-bin-line" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>

    <!-- Modal de Detalles -->
    <VDialog
      v-model="detailDialog"
      max-width="700px"
    >
      <VCard v-if="selectedSale">
        <VCardTitle class="pa-5 d-flex justify-space-between align-center">
          <h5 class="text-h5">
            Detalles de Venta #{{ selectedSale.id }}
          </h5>
          <VBtn
            icon
            size="small"
            variant="text"
            @click="detailDialog = false"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <!-- Información General -->
          <VRow class="mb-4">
            <VCol cols="6">
              <div class="text-caption text-disabled">
                Fecha
              </div>
              <div class="font-weight-medium">
                {{ formatDate(selectedSale.created_at) }}
              </div>
            </VCol>
            <VCol cols="6">
              <div class="text-caption text-disabled">
                Vendedor
              </div>
              <div class="font-weight-medium">
                {{ selectedSale.user?.name || '-' }}
              </div>
            </VCol>
            <VCol cols="6">
              <div class="text-caption text-disabled">
                Cliente
              </div>
              <div class="font-weight-medium">
                {{ selectedSale.client?.full_name || 'Cliente General' }}
              </div>
            </VCol>
            <VCol cols="6">
              <div class="text-caption text-disabled">
                Método de Pago
              </div>
              <VChip
                :color="getPaymentMethodColor(selectedSale.payment_method)"
                size="small"
              >
                {{ getPaymentMethodLabel(selectedSale.payment_method) }}
              </VChip>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Items de la Venta -->
          <h6 class="text-h6 mb-3">
            Productos
          </h6>
          <VTable density="compact">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in selectedSale.items"
                :key="item.id"
              >
                <td>{{ item.product?.name || '-' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatCurrency(item.unit_price, selectedSale.payment_method) }}</td>
                <td class="font-weight-bold">
                  {{ formatCurrency(item.total_price,
                                    selectedSale.payment_method) }}
                </td>
              </tr>
            </tbody>
          </VTable>

          <VDivider class="my-4" />

          <!-- Total -->
          <div class="d-flex justify-space-between align-center">
            <h5 class="text-h5">
              Total:
            </h5>
            <h4 class="text-h4 text-primary font-weight-bold">
              {{ formatCurrency(selectedSale.total, selectedSale.payment_method) }}
            </h4>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
