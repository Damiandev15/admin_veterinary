<script setup>
import { isPermission } from '@/utils/constants'
import Swal from 'sweetalert2'

const schedulings = ref([])
const searchQuery = ref('')
const statusFilter = ref(null)
const currentPage = ref(1)
const totalPage = ref(1)

const statuses = [
  { title: 'Todos', value: null },
  { title: 'Pendiente', value: 'PENDIENTE' },
  { title: 'Procesado', value: 'PROCESADO' },
  { title: 'Cancelado', value: 'CANCELADO' },
]

const list = async () => {
  try {
    const resp = await $api('/client-schedulings', {
      method: 'GET',
      params: {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    })

    schedulings.value = resp.schedulings.data
    totalPage.value = resp.schedulings.last_page
  } catch (error) {
    console.error(error)
  }
}

const selectedScheduling = ref(null)
const isDetailsDialogVisible = ref(false)

const showDetails = item => {
  selectedScheduling.value = item
  isDetailsDialogVisible.value = true
}

const updateStatus = async (id, status) => {
  try {
    await $api(`/client-schedulings/${id}/status`, {
      method: 'PUT',
      body: { status },
    })
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Estado actualizado correctamente', timer: 1500, showConfirmButton: false })
    list()
    isDetailsDialogVisible.value = false
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado' })
  }
}

const getStatusColor = status => {
  if (status === 'PENDIENTE') return 'warning'
  if (status === 'PROCESADO') return 'success'
  if (status === 'CANCELADO') return 'error'
  
  return 'secondary'
}

const deleteScheduling = async id => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#607d8b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (result.isConfirmed) {
    try {
      await $api(`/client-schedulings/${id}`, { method: 'DELETE' })
      Swal.fire({ icon: 'success', title: '¡Eliminado!', text: 'El agendamiento ha sido eliminado.', timer: 1500, showConfirmButton: false })
      list()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo eliminar el agendamiento.', 'error')
    }
  }
}

const formatDateTime = (date, hour) => {
  if (!date || !hour) return ''
  const [year, month, day] = date.split('-')
  const formattedDate = `${day}-${month}-${year}`

  const [h, m] = hour.split(':')
  const hourInt = parseInt(h)
  const ampm = hourInt >= 12 ? 'PM' : 'AM'
  const h12 = hourInt % 12 || 12
  const formattedHour = `${h12}:${m} ${ampm}`

  return `${formattedDate} / ${formattedHour}`
}

onMounted(() => {
  list()
})

definePage({
  meta: {
    permisssion: 'all',
  },
})
</script>

<template>
  <div>
    <VCard title="📅 Agendamientos de Clientes">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Buscar por mascota o dueño..."
            style="inline-size: 300px;"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>
        <div style="inline-size: 200px;">
          <VSelect
            v-model="statusFilter"
            :items="statuses"
            label="Estado"
            density="compact"
            @update:model-value="list"
          />
        </div>
        <VBtn
          color="primary"
          @click="list"
        >
          Buscar
        </VBtn>
      </VCardText>

      <VCardText class="pa-0">
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Servicio</th>
              <th>Fecha/Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in schedulings"
              :key="item.id"
            >
              <td>{{ item.id }}</td>
              <td>
                <div class="d-flex align-center gap-2">
                  <VAvatar
                    size="28"
                    color="primary"
                    variant="tonal"
                  >
                    <VImg
                      v-if="item.pet_photo_url"
                      :src="item.pet_photo_url"
                    />
                    <span v-else>{{ item.pet_name.charAt(0) }}</span>
                  </VAvatar>
                  {{ item.pet_name }}
                </div>
              </td>
              <td>{{ item.owner_first_name }} {{ item.owner_last_name }}</td>
              <td>{{ item.service_type }}</td>
              <td>{{ formatDateTime(item.date, item.hour) }}</td>
              <td>
                <VChip
                  :color="getStatusColor(item.status)"
                  size="small"
                >
                  {{ item.status }}
                </VChip>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <IconBtn
                    color="primary"
                    title="Ver Detalles"
                    @click="showDetails(item)"
                  >
                    <VIcon icon="ri-eye-line" />
                  </IconBtn>
                  <IconBtn
                    color="error"
                    title="Eliminar"
                    @click="deleteScheduling(item.id)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
        <div class="pa-4">
          <VPagination
            v-model="currentPage"
            :length="totalPage"
            @update:model-value="list"
          />
        </div>
      </VCardText>
    </VCard>

    <!-- Modal de Detalles -->
    <VDialog
      v-model="isDetailsDialogVisible"
      max-width="900"
    >
      <VCard v-if="selectedScheduling">
        <VCardTitle class="pa-4 bg-primary text-white d-flex justify-space-between align-center">
          Detalles del Agendamiento #{{ selectedScheduling.id }}
          <VBtn
            icon="ri-close-line"
            variant="text"
            color="white"
            @click="isDetailsDialogVisible = false"
          />
        </VCardTitle>

        <VCardText class="pa-6">
          <VRow>
            <!-- Info Cita -->
            <VCol
              cols="12"
              class="mb-4"
            >
              <h3 class="text-h6 text-primary border-bottom mb-3">
                📋 Información del Agendamiento
              </h3>
              <p><strong>Servicio:</strong> {{ selectedScheduling.service_type }}</p>
              <p>
                <strong>Fecha y Hora:</strong> {{ formatDateTime(selectedScheduling.date,
                                                                 selectedScheduling.hour) }}
              </p>
              <p>
                <strong>Descripción:</strong> {{ selectedScheduling.description || 'Sin descripción' }}
              </p>
              <p>
                <strong>Estado Actual:</strong>
                <VChip
                  :color="getStatusColor(selectedScheduling.status)"
                  size="small"
                >
                  {{
                    selectedScheduling.status }}
                </VChip>
              </p>
            </VCol>

            <!-- Info Mascota -->
            <VCol
              cols="12"
              md="6"
            >
              <h3 class="text-h6 text-primary border-bottom mb-3">
                🐶 Datos de la Mascota
              </h3>
              <div class="d-flex gap-4">
                <div
                  v-if="selectedScheduling.pet_photo_url"
                  class="mb-4"
                >
                  <img
                    :src="selectedScheduling.pet_photo_url"
                    class="rounded border"
                    style="width: 150px; height: 150px; object-fit: cover;"
                  >
                </div>
                <div>
                  <p><strong>Nombre:</strong> {{ selectedScheduling.pet_name }}</p>
                  <p><strong>Especie:</strong> {{ selectedScheduling.pet_specie }}</p>
                  <p><strong>Raza:</strong> {{ selectedScheduling.pet_breed }}</p>
                  <p>
                    <strong>Género:</strong> {{ selectedScheduling.pet_gender === 'M' ? 'Macho' :
                      'Hembra' }}
                  </p>
                  <p><strong>Nacimiento:</strong> {{ selectedScheduling.pet_dirth_date }}</p>
                  <p><strong>Peso:</strong> {{ selectedScheduling.pet_weight }} KG</p>
                  <p><strong>Color:</strong> {{ selectedScheduling.pet_color }}</p>
                </div>
              </div>
              <p class="mt-2">
                <strong>Notas Médicas:</strong> {{ selectedScheduling.pet_medical_notes ||
                  'Ninguna' }}
              </p>
            </VCol>

            <!-- Info Dueño -->
            <VCol
              cols="12"
              md="6"
            >
              <h3 class="text-h6 text-primary border-bottom mb-3">
                🧔 Datos del Propietario
              </h3>
              <p>
                <strong>Nombre Completo:</strong> {{ selectedScheduling.owner_first_name }} {{
                  selectedScheduling.owner_last_name }}
              </p>
              <p><strong>Email:</strong> {{ selectedScheduling.owner_email }}</p>
              <p><strong>Teléfono:</strong> {{ selectedScheduling.owner_phone }}</p>
              <p>
                <strong>Ubicación:</strong> {{ selectedScheduling.owner_city }}, {{
                  selectedScheduling.owner_address }}
              </p>
              <p>
                <strong>Identidad:</strong> {{ selectedScheduling.owner_type_document }} - {{
                  selectedScheduling.owner_n_document }}
              </p>
              <p><strong>RRSS:</strong> {{ selectedScheduling.owner_social_media || 'No asig.' }}</p>
              <p>
                <strong>Contacto Emergencia:</strong> {{ selectedScheduling.owner_emergency_contact ||
                  'Sin datos' }}
              </p>
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4 justify-end">
          <VBtn
            v-if="selectedScheduling.status === 'PENDIENTE'"
            color="error"
            variant="outlined"
            @click="updateStatus(selectedScheduling.id, 'CANCELADO')"
          >
            Cancelar Solicitud
          </VBtn>
          <VBtn
            v-if="selectedScheduling.status === 'PENDIENTE'"
            color="success"
            @click="updateStatus(selectedScheduling.id, 'PROCESADO')"
          >
            Marcar como Procesado
          </VBtn>
          <VBtn
            color="secondary"
            @click="isDetailsDialogVisible = false"
          >
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.border-bottom {
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
