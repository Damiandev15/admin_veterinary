<script setup>
import Swal from 'sweetalert2'


const form = ref({
  vaccination_date: null,
  time: null,
  amount: 0,
  method_payment: 'DIVISAS',
  amount_add: 0,
})

const route = useRoute('vaccination-edit-id')
const router = useRouter()

const method_payments = ref([
  "DIVISAS",
  "PAGO MOVIL",
  "PUNTO DE VENTA",
  "TRANSFERENCIA",
  "ZELLE",
  "USDT",
])

const veterinarie_id = ref(null)
const veterinaries = ref([])
const reason = ref(null)
const vaccine_names = ref(null)
const nex_due_date = ref(null)
const outside = ref('0')
const vaccination_selected = ref(null)
const state = ref(1)

const reset = () => {
  form.value.vaccination_date = null
  form.value.time = null
}

const listVeterinaries = async () => {
  try {
    const resp = await $api('/veterinaries', {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })

    veterinaries.value = resp.veterinaries.data
  } catch (error) {
    console.log(error)
  }
}

const update = async () => {
  try {
    if (!reason.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido digitar una razon para la atención de la mascota" })
      
      return
    }

    if (!select_pet.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido seleccionar una mascota" })
      
      return
    }

    if (!vaccine_names.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido llenar el nombre de las vacunas" })
      
      return
    }

    if (!nex_due_date.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido seleccionar una fecha para la siguiente vacuna" })
      
      return
    }

    if (!form.value.amount) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar el costo de la cita medica" })
      
      return
    }

    let data = {
      veterinarie_id: veterinarie_id.value,
      pet_id: select_pet.value.id,
      vaccination_date: form.value.vaccination_date,
      reason: reason.value,
      amount: form.value.amount,
      selected_segment_times: [], // Slot management removed as per UI removal
      vaccine_names: vaccine_names.value,
      outside: outside.value,
      nex_due_date: nex_due_date.value,
      state: state.value,
    }

    const resp = await $api('/vaccinations/' + route.params.id, {
      method: 'PATCH',
      body: data,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' })
      },
    })

    console.log(resp)
    if (resp.message == 403) {
      Swal.fire({ icon: 'error', title: 'Error', text: resp.message_text })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'La vacuna se ha editado correctamente',
        showConfirmButton: false,
        timer: 1500,
      })

      setTimeout(() => {
        router.push({ name: 'vaccination-list' })
      }, 1500)

      show()
      reset()
    }
  } catch (error) {
    console.log(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' })
  }

}


// CODIGO PARA LA BUSQUEDA DEL PACIENTE(MASCOTA)
const loading = ref(false)
const search = ref()
const select_pet = ref(null)
const items = ref([])

const querySelections = async query => {
  loading.value = true

  // Simulated ajax query
  setTimeout(async () => {
    const resp = await $api("/appointments/search-pets/" + query, {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al buscar mascotas' })
      },
    })

    console.log(resp)
    items.value = resp.pets
    loading.value = false
  }, 500)
}

watch(search, query => {
  if (query && query.length > 1) {
    querySelections(query)
  } else {
    items.value = []
  }
})

const show = async () => {
  try {
    const resp = await $api("/vaccinations/" + route.params.id, {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información de la vacuna' })
      },
    })

    console.log(resp)
    vaccination_selected.value = resp.vaccination
    reason.value = vaccination_selected.value.reason
    form.value.amount = vaccination_selected.value.amount
    state.value = vaccination_selected.value.state
    select_pet.value = vaccination_selected.value.pet
    veterinarie_id.value = vaccination_selected.value.veterinarie_id
    vaccine_names.value = vaccination_selected.value.vaccine_names
    outside.value = vaccination_selected.value.outside + ""
    nex_due_date.value = vaccination_selected.value.nex_due_date
    state.value = vaccination_selected.value.state
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  show()
  listVeterinaries()
})

// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
  meta: {
    permisssion: 'edit_vaccionation',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Edit Vaccination 🐄 {{ route.params.id }}
        </h4>
      </div>
    </VCardText>

    <VCard
      title="🔎 Busqueda:"
      class="pa-4"
    >
      <VRow>
        <VCol cols="4">
          <AppDateTimePicker
            v-model="form.vaccination_date"
            label="Fecha de la vacuna"
            :config="{
              minDate: 'today', disable: [
                (date) => {
                  // Deshabilita sábados (6) y domingos (0)
                  return date.getDay() === 0 || date.getDay() === 6;
                },
              ]
            }"
          />
        </VCol>
        <VCol cols="3">
          <AppDateTimePicker
            v-model="form.time"
            label="Hora de la vacuna"
            :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
          />
        </VCol>
        <VCol cols="3">
          <VBtn
            color="secondary"
            class="mx-1"
            prepend-icon="ri-restart-line"
            @click="reset"
          />
        </VCol>
      </VRow>
    </VCard>

    <VCard
      title="🧑‍⚕️ Veterinario y Motivo:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="4">
          <VSelect
            v-model="veterinarie_id"
            :items="veterinaries"
            label="Veterinario"
            item-title="full_name"
            item-value="id"
            placeholder="Selecciona un veterinario"
            eager
          />
        </VCol>
        <VCol cols="4">
          <AppDateTimePicker
            v-model="nex_due_date"
            label="Fecha de la proxima vacuna"
            :config="{
              minDate: 'today', disable: [
                (date) => {
                  // Deshabilita sábados (6) y domingos (0)
                  return date.getDay() === 0 || date.getDay() === 6;
                },
              ]
            }"
          />
        </VCol>
        <VCol cols="4">
          <VRadioGroup
            v-model="outside"
            inline
          >
            <VRadio
              label="Dentro de la veterinaria"
              value="0"
            />
            <VRadio
              label="Fuera de la veterinaria"
              value="1"
            />
          </VRadioGroup>
        </VCol>
        <VCol cols="6">
          <VTextarea
            v-model="reason"
            label="Razon de la vacuna:"
            placeholder="Motivo..."
          />
        </VCol>
        <VCol cols="6">
          <VTextarea
            v-model="vaccine_names"
            label="Vacunas:"
            placeholder="Nombres de las vacunas..."
          />
        </VCol>
      </VRow>
    </VCard>

    <VCard
      v-if="vaccination_selected"
      title="⏱️ Hora de atención:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="3">
          <VSelect
            v-model="state"
            :items="[
              {
                name: 'Pendiente',
                id: 1,
              },
              {
                name: 'Cancelado',
                id: 2,
              },
              {
                name: 'Atendido',
                id: 3,
              }
            ]"
            label="Estado de la vacuna"
            item-title="name"
            item-value="id"
            :disabled="vaccination_selected.state == 2 || vaccination_selected.state == 3 ? true : false"
            placeholder="Select Estado"
            eager
          />
        </VCol>
        <VCol
          v-if="vaccination_selected.schedule_for_hour && vaccination_selected.schedule_for_hour.length > 0"
          cols="8"
        >
          <VTable>
            <thead>
              <tr>
                <th class="text-uppercase">
                  Veterinario
                </th>
                <th class="text-uppercase">
                  Dia de la vacuna
                </th>
                <th class="text-uppercase">
                  Horario de atención
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  {{ vaccination_selected.veterinarie.full_name }}
                </td>
                <td>
                  {{ vaccination_selected.vaccination_date }}
                </td>
                <td>
                  <ul>
                    <template
                      v-for="(for_hour, index) in vaccination_selected.schedule_for_hour"
                      :key="index"
                    >
                      <template v-if="!for_hour.is_complete">
                        <li
                          v-for="(schedule, index2) in for_hour.segments_time"
                          :key="index2"
                        >
                          <label
                            for=""
                            style="font-weight: bold;"
                          >{{
                            schedule.schedule_hour.hour_start_format + ' ' +
                              schedule.schedule_hour.hour_end_format }}</label>
                        </li>
                      </template>
                      <li v-if="for_hour.is_complete">
                        <label
                          for=""
                          style="font-weight: bold;"
                        >{{ for_hour.hour_format
                        }}</label>
                      </li>
                    </template>
                  </ul>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>
    </VCard>
    <VCard
      title="🐶 Paciente:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="4">
          <VAutocomplete
            v-model="select_pet"
            v-model:search="search"
            :loading="loading"
            :items="items"
            item-title="name"
            item-value="id"
            return-object
            placeholder="Ingresa información de la mascota"
            label="¿Quien es la mascotita?"
            variant="underlined"
            :menu-props="{ maxHeight: '200px' }"
          />
        </VCol>
        <VCol
          v-if="select_pet"
          cols="2"
        >
          <label for="">Especie: {{ select_pet.specie }}</label>
          <br>
          <label for="">Raza: {{ select_pet.breed }}</label>
        </VCol>
        <VCol
          v-if="select_pet"
          cols="3"
        >
          <label for="">Nombre y Apellido: {{ select_pet.owner.first_name + ' ' + select_pet.owner.last_name
          }}</label>
          <br>
          <label for="">Telefono: {{ select_pet.owner.phone }}</label>
          <br>
          <label for="">Documento: {{ select_pet.owner.n_document }}</label>
        </VCol>
      </VRow>
    </VCard>
    <VCard
      title="💵 Pagos:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="4">
          <VTextField
            v-model="form.amount"
            label="Costo de la vacuna:"
            type="number"
            placeholder="Example: 100"
          />
        </VCol>
      </VRow>
    </VCard>

    <VCardText class="pa-5 py-0 text-end">
      <VBtn
        color="primary"
        class="mb-4"
        @click="update"
      >
        Editar
      </VBtn>
    </VCardText>
  </div>
</template>