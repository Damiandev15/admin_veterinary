<script setup>
import { $clientApi } from '@/utils/clientApi'
import Swal from 'sweetalert2'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const clientData = ref(JSON.parse(localStorage.getItem('client_data') || '{}'))
const token = localStorage.getItem('client_token')

if (!token) {
  window.location.href = '/cliente/login'
}

const form = ref({
  // Scheduling info
  date: '',
  hour: '',
  service_type: null,
  description: '',

  // Pet info
  pet_name: '',
  pet_specie: 'Canino',
  pet_breed: '',
  pet_dirth_date: '',
  pet_gender: 'M',
  pet_color: '',
  pet_weight: '',
  pet_medical_notes: '',

  // Owner info (Snapshotted for the request)
  owner_first_name: clientData.value.full_name?.split(' ')[0] || '',
  owner_last_name: clientData.value.full_name?.split(' ').slice(1).join(' ') || '',
  owner_email: clientData.value.email || '',
  owner_phone: clientData.value.phone || '',
  owner_address: '',
  owner_city: '',
  owner_type_document: 'Cédula de Identidad',
  owner_n_document: '',
  owner_emergency_contact: '',
  owner_emergency_contact: '',
  owner_social_media: '',
})

// Euthanasia specific logic
const euthanasia_reason = ref('')
const isTermsAccepted = ref(false)
const showTermsModal = ref(false)

watch(() => form.value.service_type, newVal => {
  if (newVal !== 'Eutanasia') {
    isTermsAccepted.value = false
    euthanasia_reason.value = ''
  }
})

const species = ['Canino', 'Felino']
const services = ['Peluqueria', 'Cita Medica', 'Cirugia', 'Consulta', 'Eutanasia']
const type_documents = ['Cédula de Identidad', 'PASAPORTE', 'CARNET DE EXTRANJERIA']

const FILE_PET = ref(null)
const PET_PREVIEW = ref(null)
const loading = ref(false)

const loadFile = $event => {
  const file = $event.target.files[0]
  if (!file) return
  FILE_PET.value = file

  const reader = new FileReader()

  reader.readAsDataURL(file)
  reader.onloadend = () => PET_PREVIEW.value = reader.result
}

const logout = () => {
  localStorage.removeItem('client_token')
  localStorage.removeItem('client_data')
  window.location.href = '/cliente/login'
}

const submitAgenda = async () => {
  if (!form.value.date || !form.value.hour || !form.value.service_type || !form.value.pet_name) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor complete los campos obligatorios del agendamiento y mascota.' })
    
    return
  }

  if (form.value.service_type === 'Eutanasia') {
    if (!isTermsAccepted.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe aceptar los términos y condiciones para solicitar una eutanasia.' })
      
      return
    }
    if (!euthanasia_reason.value) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor indique el motivo para solicitar la eutanasia.' })
      
      return
    }

    // Append reason to description
    form.value.description = (form.value.description ? form.value.description + '\n' : '') + 'RAZÓN EUTANASIA: ' + euthanasia_reason.value
  }

  loading.value = true

  const formData = new FormData()

  // Append all fields
  Object.keys(form.value).forEach(key => {
    const value = form.value[key]
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value)
    }
  })

  if (FILE_PET.value) {
    formData.append('pet_photo_file', FILE_PET.value)
  }

  try {
    await $clientApi('/scheduling', {
      method: 'POST',
      body: formData,
    })

    Swal.fire({
      icon: 'success',
      title: '¡Agendado!',
      text: 'Tu solicitud ha sido enviada. Pronto nos pondremos en contacto contigo.',
      showConfirmButton: true,
    }).then(() => {
      // Clear pet part of the form but keep owner info maybe?
      form.value.pet_name = ''
      form.value.description = ''
      PET_PREVIEW.value = null
    })
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al procesar tu solicitud.' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="agenda-wrapper min-h-screen">
    <!-- Header -->
    <header class="agenda-header pa-4 d-flex align-center justify-space-between text-white">
      <div class="d-flex align-center gap-2">
        <VIcon
          icon="ri-calendar-event-line"
          size="32"
          color="primary"
        />
        <h1 class="text-h5 font-weight-bold">
          Veterinaria - Agendamiento
        </h1>
      </div>
      <div class="d-flex align-center gap-4">
        <span class="d-none d-sm-block">Hola, <strong>{{ clientData.full_name }}</strong></span>
        <VBtn
          icon="ri-logout-box-r-line"
          variant="text"
          color="error"
          @click="logout"
        />
      </div>
    </header>

    <div class="container mx-auto pa-4 pa-md-8 max-w-5xl">
      <h2 class="text-h4 text-white mb-6 text-center">
        Programar Nueva Cita
      </h2>

      <VForm @submit.prevent="submitAgenda">
        <!-- 📅 Información de la Cita -->
        <VCard
          class="agenda-card mb-6 pa-6"
          title="📅 Información del Servicio"
        >
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-model="form.service_type"
                :items="services"
                label="Tipo de Servicio"
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.date"
                label="Fecha"
                type="date"
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.hour"
                label="Hora"
                type="time"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="Descripción / Motivo (Opcional)"
                rows="2"
              />
            </VCol>

            <!-- Campos para Eutanasia -->
            <VCol
              v-if="form.service_type === 'Eutanasia'"
              cols="12"
            >
              <VTextarea
                v-model="euthanasia_reason"
                label="Razon de la Eutanasia"
                placeholder="Por favor explique por qué solicita este procedimiento..."
                rows="3"
                required
                :rules="[v => !!v || 'La razón es requerida']"
              />

              <div class="d-flex align-center bg-grey-darken-3 rounded pa-4 mt-4">
                <VCheckbox
                  v-model="isTermsAccepted"
                  color="error"
                  hide-details
                  class="mr-4"
                >
                  <template #label>
                    <span class="text-body-1 font-weight-medium text-white">
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
              </div>
            </VCol>
          </VRow>
        </VCard>

        <!-- Terms Modal -->
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
            <VCardText class="pa-6 text-body-1 text-black">
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
                  Entiendo que este procedimiento es <strong>irreversible</strong> y
                  resulta en la muerte
                  de la mascota.
                </li>
                <li class="mb-2">
                  Confirmo que esta decisión se toma buscando el bienestar del animal,
                  evitando
                  sufrimientos innecesarios debido a su condición médica, edad avanzada o enfermedad
                  terminal.
                </li>
                <li class="mb-2">
                  Exonero de toda responsabilidad legal, civil y penal al médico
                  veterinario actuante y a
                  la clínica veterinaria por la realización de este procedimiento solicitado bajo mi
                  expreso
                  consentimiento.
                </li>
              </ul>
              <p>
                Al marcar la casilla de aceptación, confirmo que he leído, entendido y estoy de acuerdo
                con todo lo
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

        <VRow>
          <!-- 🐶 Información de la Mascota -->
          <VCol
            cols="12"
            md="7"
          >
            <VCard
              class="agenda-card h-100 pa-6"
              title="🐶 Datos de la Mascota"
            >
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="form.pet_name"
                    label="Nombre de la Mascota"
                    required
                  />
                </VCol>
                <VCol cols="6">
                  <VSelect
                    v-model="form.pet_specie"
                    :items="species"
                    label="Especie"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="form.pet_breed"
                    label="Raza"
                    required
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="form.pet_dirth_date"
                    label="Fecha de Nacimiento"
                    type="date"
                    required
                  />
                </VCol>
                <VCol cols="6">
                  <VRadioGroup
                    v-model="form.pet_gender"
                    inline
                    label="Género"
                  >
                    <VRadio
                      label="Macho"
                      value="M"
                    />
                    <VRadio
                      label="Hembra"
                      value="H"
                    />
                  </VRadioGroup>
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="form.pet_color"
                    label="Color"
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="form.pet_weight"
                    label="Peso (KG)"
                    type="number"
                  />
                </VCol>
                <VCol cols="12">
                  <VFileInput
                    label="Foto de la Mascota"
                    accept="image/*"
                    @change="loadFile"
                  />
                  <div
                    v-if="PET_PREVIEW"
                    class="mt-4 text-center"
                  >
                    <img
                      :src="PET_PREVIEW"
                      class="pet-img-preview rounded"
                    >
                  </div>
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="form.pet_medical_notes"
                    label="Nota Médica / Observaciones"
                    rows="3"
                  />
                </VCol>
              </VRow>
            </VCard>
          </VCol>

          <!-- 🧔 Información del Propietario -->
          <VCol
            cols="12"
            md="5"
          >
            <VCard
              class="agenda-card h-100 pa-6"
              title="🧔 Datos del Propietario"
            >
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_first_name"
                    label="Nombre"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_last_name"
                    label="Apellido"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_email"
                    label="Email"
                    type="email"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_phone"
                    label="Teléfono"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_city"
                    label="Ciudad"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_address"
                    label="Dirección"
                  />
                </VCol>
                <VCol cols="12">
                  <VSelect
                    v-model="form.owner_type_document"
                    :items="type_documents"
                    label="Tipo Documento"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_n_document"
                    label="N° Documento"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.owner_social_media"
                    label="Red Social"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    v-model="form.owner_emergency_contact"
                    label="Contacto de Emergencia"
                    rows="2"
                  />
                </VCol>
              </VRow>
            </VCard>
          </VCol>
        </VRow>

        <div class="text-center mt-8">
          <VBtn
            color="primary"
            size="x-large"
            type="submit"
            :loading="loading"
            min-width="250"
          >
            Confirmar Agendamiento
          </VBtn>
        </div>
      </VForm>
    </div>
  </div>
</template>

<style lang="scss">
.agenda-wrapper {
    background-color: #282c3e;
    min-height: 100vh;
}

.agenda-header {
    background-color: #2f3349;
    border-bottom: 2px solid rgba(102, 108, 255, 0.2);
}

.agenda-card {
    background-color: #2f3349 !important;
    color: white !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;

    .v-card-title {
        color: #666cff !important;
        font-weight: bold;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 12px;
    }
}

.pet-img-preview {
    max-width: 200px;
    max-height: 200px;
    object-fit: cover;
    border: 4px solid #666cff;
}

.max-w-5xl {
    max-width: 1024px;
}
</style>
