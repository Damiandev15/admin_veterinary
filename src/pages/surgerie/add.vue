<script setup>
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()


const form = ref({
  surgerie_date: null,
  time: null,
  amount: 0,
  method_payment: 'DIVISAS',
  amount_add: 0,
})

const method_payments = ref([
  "DIVISAS",
  "PAGO MOVIL",
  "PUNTO DE VENTA",
  "TRANSFERENCIA",
  "ZELLE",
  "USDT",
])

const surgerie_types = ref([
  "ESTERILIZACIÓN",
  "CASTRACIÓN",
  "TRAUMATOLÓGICAS",
  "OCULARES",
  "ONCOLÓGICAS",
  "EUTANASIA",
  "OTRO",
])

const isTermsAccepted = ref(false)
const showTermsModal = ref(false)


const veterinarie_id = ref(null)
const veterinaries = ref([])
const medical_notes = ref(null)
const outcome = ref(null)
const surgerie_type = ref(null)
const outside = ref('0')


const euthanasia_reason = ref('')

watch(surgerie_type, newVal => {
  if (newVal !== 'EUTANASIA') {
    isTermsAccepted.value = false
    euthanasia_reason.value = ''
  }
})

const reset = () => {
  form.value.surgerie_date = null
  form.value.time = null
  veterinarie_id.value = null
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

const fieldsClean = () => {
  form.value.surgerie_date = null
  form.value.time = null
  form.value.amount = 0
  form.value.method_payment = 'DIVISAS'
  form.value.amount_add = 0
  select_pet.value = null
  medical_notes.value = null
  outcome.value = null
  outside.value = '1'
  surgerie_type.value = null
  veterinarie_id.value = null
}

const store = async () => {
  try {

    if (!form.value.surgerie_date) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "El campo de fecha es requerido" })
      
      return
    }

    if (!veterinarie_id.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es necesario seleccionar un veterinario" })
      
      return
    }

    if (!medical_notes.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido digitar una razon para la atención de la mascota" })
      
      return
    }

    if (!select_pet.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido seleccionar una mascota" })
      
      return
    }

    if (!form.value.amount) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar el costo de la cita medica" })
      
      return
    }

    if (!form.value.amount_add) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar un adelanto del costo de la cita medica" })
      
      return
    }

    if (parseInt(form.value.amount_add) > parseInt(form.value.amount)) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: "El monto de adelanto no puede ser mayor al costo de la cita" })
      
      return
    }

    if (surgerie_type.value === 'EUTANASIA') {
      if (!isTermsAccepted.value) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: "Debe aceptar los términos y condiciones para realizar una eutanasia." })
        
        return
      }
      if (!euthanasia_reason.value) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: "Es OBLIGATORIO indicar la razón de la eutanasia." })
        
        return
      }

      // Append reason to medical notes
      medical_notes.value = (medical_notes.value ? medical_notes.value + '\n\n' : '') + 'RAZÓN EUTANASIA: ' + euthanasia_reason.value
    }

    let STATE_PAY = 1//PENDIENTE
    if (form.value.amount > form.value.amount_add) {
      STATE_PAY = 2//PARCIAL
    }
    if (form.value.amount == form.value.amount_add) {
      STATE_PAY = 3//COMPLETO
    }
    let data = {
      veterinarie_id: veterinarie_id.value,
      pet_id: select_pet.value.id,
      surgerie_date: form.value.surgerie_date,
      medical_notes: medical_notes.value,
      surgerie_type: surgerie_type.value,
      amount: form.value.amount,
      state_pay: STATE_PAY,
      method_payment: form.value.method_payment,
      adelanto: form.value.amount_add,
      selected_segment_times: [], // Slot management removed as per UI removal
      outcome: outcome.value,
      outside: outside.value,
    }

    const resp = await $api('/surgeries', {
      method: 'POST',
      body: data,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' })
      },
    })

    console.log(resp)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'La cirugía se ha programado correctamente',
      showConfirmButton: false,
      timer: 1500,
    })

    setTimeout(() => {
      router.push({ name: 'surgerie-list' })
    }, 1500)

    fieldsClean()

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

const loadAllPets = async () => {
  loading.value = true
  try {
    const resp = await $api("/pets", {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las mascotas' })
      },
    })

    items.value = resp.pets.data.map(pet => ({
      id: pet.id,
      name: pet.name,
      specie: pet.specie,
      breed: pet.breed,
      owner: pet.owner,
    }))
  } catch (error) {
    console.log(error)
  }
  loading.value = false
}

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
  } else if (!query) {
    loadAllPets()
  }
})

onMounted(() => {
  loadAllPets()
  listVeterinaries()
})

// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
  meta: {
    permisssion: 'register_surgeries',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Registrar Cirugía 🏥
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
            v-model="form.surgerie_date"
            label="Fecha de la cirugía"
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
            label="Hora de la cirugía"
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
      title="🧑‍⚕️ Veterinario y Cirugía:"
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
          <VSelect
            v-model="surgerie_type"
            :items="surgerie_types"
            label="Tipo de cirugías"
            placeholder="Select Tipo"
            eager
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
            v-model="medical_notes"
            label="Nota medica:"
            placeholder="Motivo de la cirugía..."
          />
        </VCol>
        <VCol cols="6">
          <VTextarea
            v-model="outcome"
            label="Resultado de la cirugía:"
            placeholder="Resultado..."
          />
        </VCol>
      </VRow>


      <!-- Sección de Términos y Condiciones para Eutanasia -->
      <!-- Sección de Términos y Condiciones para Eutanasia -->
      <VRow
        v-if="surgerie_type === 'EUTANASIA'"
        class="mt-2"
      >
        <VCol cols="12">
          <VTextarea
            v-model="euthanasia_reason"
            label="Razón de la Eutanasia"
            placeholder="Explique detalladamente el motivo..."
            rows="3"
            color="error"
            persistent-placeholder
          />
        </VCol>
        <VCol
          cols="12"
          class="d-flex align-center bg-grey-lighten-4 rounded pa-4"
        >
          <VCheckbox
            v-model="isTermsAccepted"
            color="error"
            hide-details
            class="mr-4"
          >
            <template #label>
              <span class="text-body-1 font-weight-medium">
                He leído y acepto los
                <a
                  href="javascript:void(0)"
                  class="text-error font-weight-bold text-decoration-underline"
                  @click.stop="showTermsModal = true"
                >
                  Términos y Condiciones
                </a>
                para el procedimiento de Eutanasia.
              </span>
            </template>
          </VCheckbox>
        </VCol>
      </VRow>

      <VDialog
        v-model="showTermsModal"
        max-width="600"
      >
        <VCard>
          <VCardTitle class="text-h5 pa-4 bg-error text-white">
            <VIcon
              icon="ri-alert-fill"
              class="mr-2"
              color="white"
            />
            Términos y Condiciones - Eutanasia
          </VCardTitle>
          <VCardText class="pa-6 text-body-1">
            <p class="mb-4">
              <strong>CONSENTIMIENTO INFORMADO PARA EUTANASIA</strong>
            </p>
            <p class="mb-4">
              Por la presente autorizo al equipo médico veterinario de esta clínica a realizar la
              eutanasia
              humanitaria de la mascota descrita en este formulario.
            </p>
            <ul class="ml-4 mb-4 list-disc">
              <li class="mb-2">
                Declaro bajo juramento ser el propietario legal o el representante
                autorizado de la
                mascota y tener la plena autoridad para tomar esta decisión final.
              </li>
              <li class="mb-2">
                Entiendo que este procedimiento es <strong>irreversible</strong> y resulta
                en la muerte
                de la mascota.
              </li>
              <li class="mb-2">
                Confirmo que esta decisión se toma buscando el bienestar del animal,
                evitando
                sufrimientos innecesarios debido a su condición médica, edad avanzada o enfermedad
                terminal.
              </li>
              <li class="mb-2">
                Exonero de toda responsabilidad legal, civil y penal al médico veterinario
                actuante y a
                la clínica veterinaria por la realización de este procedimiento solicitado bajo mi
                expreso
                consentimiento.
              </li>
            </ul>
            <p>
              Al marcar la casilla de aceptación, confirmo que he leído, entendido y estoy de acuerdo con
              todo lo
              expuesto anteriormente.
            </p>
          </VCardText>
          <VCardActions class="pa-4 justify-end">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="showTermsModal = false"
            >
              Cerrar
            </VBtn>
            <VBtn
              color="error"
              @click="isTermsAccepted = true; showTermsModal = false"
            >
              Acepto los Términos
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
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
            label="Costo de la cirugía:"
            type="number"
            placeholder="Example: 100"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="4">
          <VSelect
            v-model="form.method_payment"
            :items="method_payments"
            label="Metodos de pago"
            item-title="name"
            item-value="id"
            placeholder="Select Metodo"
            eager
          />
        </VCol>
        <VCol cols="4">
          <VTextField
            v-model="form.amount_add"
            label="Adelanto:"
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
        @click="store"
      >
        Crear
      </VBtn>
    </VCardText>
  </div>
</template>