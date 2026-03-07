<script setup>
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: null,
  surname: null,
  email: null,
  phone: null,
  type_document: 'Cédula de Identidad',
  n_document: null,
  birthday: null,
  designation: null,
  gender: null,
  role_id: null,
  designation: null,
  password: null,
})

const type_documents = [
  'Cédula de Identidad',
  'PASAPORTE',
  'CARNET DE EXTRANJERIA',
]

const isPasswordVisible = ref(false)
const FILE_AVATAR = ref(null)

const IMAGEN_PREVIZUALIZA = ref(null)
const roles = ref([])
const days = ref(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'])
const hour_days = ref([])
const selected_segment_time = ref([])
const schedule_hour_veterinarie = ref([])
const load_request = ref(null)

const loadFile = $event => {
  const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event)
  if (!file) return

  if (file.type.indexOf("image") < 0) {
    FILE_AVATAR.value = null
    IMAGEN_PREVIZUALIZA.value = null
    Swal.fire({ icon: 'error', title: 'Error', text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN' })
    
    return
  }

  // warning.value = '';

  FILE_AVATAR.value = $event.target.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(FILE_AVATAR.value)
  reader.onloadend = () => IMAGEN_PREVIZUALIZA.value = reader.result
}

const config = async () => {
  try {
    const resp = await $api("/veterinaries/config", {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la configuración de veterinarios' })
      },
    })

    console.log(resp)
    roles.value = resp.roles
    hour_days.value = resp.schedule_hours_groups
  } catch (error) {
    console.log(error)
  }
}

const selectSegmentTimeAll = ($event, segment_times, day) => {
  if ($event.target.checked) {
    // EL CHECKBOX ESTA MARCADO
    segment_times.forEach(segment_time => {
      selectedSegmentTime($event, segment_time, day)
      let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id + '-' + day)
      if (INDEX == -1) {
        selected_segment_time.value.push(segment_time.id + '-' + day)
      }
    })
  } else {
    // EL CHECKBOX ESTA DESMARCADO
    segment_times.forEach(segment_time => {
      selectedSegmentTime($event, segment_time, day)
      let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id + '-' + day)
      if (INDEX != -1) {
        selected_segment_time.value.splice(INDEX, 1)
      }
    })
  }
}

const selectSegmentTimeAllGroups = ($event, segment_times) => {
  if ($event.target.checked) {
    // EL CHECKBOX ESTA MARCADO
    days.value.forEach(day => {
      segment_times.forEach(segment_time => {
        selectedSegmentTime($event, segment_time, day)
        let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id + '-' + day)
        if (INDEX == -1) {
          selected_segment_time.value.push(segment_time.id + '-' + day)
        }
      })
    })
  } else {
    // EL CHECKBOX ESTA DESMARCADO
    days.value.forEach(day => {
      segment_times.forEach(segment_time => {
        selectedSegmentTime($event, segment_time, day)
        let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id + '-' + day)
        if (INDEX != -1) {
          selected_segment_time.value.splice(INDEX, 1)
        }
      })
    })
  }
}

const selectedSegmentTime = ($event, segment_time, day) => {
  if ($event.target.checked) {
    // EL CHECKBOX ESTA MARCADO
    let INDEX = schedule_hour_veterinarie.value.findIndex(seg_time => seg_time.id_seg == segment_time.id + '-' + day)
    if (INDEX == -1) {
      schedule_hour_veterinarie.value.push({
        id_seg: segment_time.id + '-' + day,
        segment_time_id: segment_time.id,
        day: day,
      })
    }
  } else {
    // EL CHECKBOX ESTA DESMARCADO
    let INDEX = schedule_hour_veterinarie.value.findIndex(seg_time => seg_time.id_seg == segment_time.id + '-' + day)
    if (INDEX != -1) {
      schedule_hour_veterinarie.value.splice(INDEX, 1)
    }
  }
}

const fieldsClean = () => {
  form.value = {
    name: null,
    surname: null,
    email: null,
    phone: null,
    type_document: 'Cédula de Identidad',
    n_document: null,
    birthday: null,
    designation: null,
    gender: null,
    role_id: null,
    password: null,
  }
  FILE_AVATAR.value = null
  IMAGEN_PREVIZUALIZA.value = null
  schedule_hour_veterinarie.value = []
  selected_segment_time.value = []
}

const store = async () => {

  if (schedule_hour_veterinarie.value.length == 0) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Debes programar la disponibilidad laboral del veterinario" })
    
    return
  }

  if (!form.value.name) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el nombre del veterinario" })
    
    return
  }

  if (!form.value.surname) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el apellido del veterinario" })
    
    return
  }

  if (!form.value.email) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el email del veterinario" })
    
    return
  }

  if (!form.value.phone) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el telefono del veterinario" })
    
    return
  }

  if (!form.value.gender) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el genero del veterinario" })
    
    return
  }

  if (!FILE_AVATAR.value) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un avatar para el veterinario" })
    
    return
  }

  if (!form.value.role_id) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un rol para el veterinario" })
    
    return
  }

  if (!form.value.password) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe digitar una contraseña para el veterinario" })
    
    return
  }


  let formData = new FormData()

  formData.append("name", form.value.name)
  formData.append("surname", form.value.surname)
  formData.append("email", form.value.email)
  if (form.value.type_document) {
    formData.append("type_document", form.value.type_document)
  }
  if (form.value.n_document) {
    formData.append("n_document", form.value.n_document)
  }
  formData.append("phone", form.value.phone)
  formData.append("gender", form.value.gender)
  if (form.value.designation) {
    formData.append("designation", form.value.designation)
  }
  formData.append("password", form.value.password)
  formData.append("role_id", form.value.role_id)
  if (form.value.birthday) {
    formData.append("birthday", form.value.birthday)
  }
  formData.append("imagen", FILE_AVATAR.value)
  formData.append("schedule_hour_veterinarie", JSON.stringify(schedule_hour_veterinarie.value))
  try {
    load_request.value = true

    const resp = await $api('/veterinaries', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' })
      },
    })

    console.log(resp)
    load_request.value = false
    if (resp.message == 403) {
      Swal.fire({ icon: 'error', title: 'Error', text: resp.message_text })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El veterinario se ha creado correctamente',
        showConfirmButton: false,
        timer: 1500,
      })

      setTimeout(() => {
        router.push({ name: 'veterinarie-list' })
      }, 1500)

      fieldsClean()
    }

  } catch (error) {
    console.log(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' })
  }

}

onMounted(() => {
  config()
})

definePage({
  meta: {
    permisssion: 'register_veterinary',
  },
})
</script>

<template>
  <div>
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Añadir Veterinario 🧑‍⚕️
          </h4>
        </div>

        <VRow>
          <VCol cols="6">
            <VTextField
              v-model="form.name"
              label="Nombre:"
              placeholder="Example: Rafael"
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.surname"
              label="Apellido:"
              placeholder="Example: Mendoza"
            />
          </VCol>

          <VCol cols="4">
            <VTextField
              v-model="form.phone"
              label="Telefono:"
              type="number"
              placeholder="Example: 99999999"
            />
          </VCol>
          <VCol cols="4">
            <VSelect
              v-model="form.type_document"
              :items="type_documents"
              label="Tipo de documento"
              placeholder="Select Item"
              eager
            />
          </VCol>
          <VCol cols="4">
            <VTextField
              v-model="form.n_document"
              label="N° de documento:"
              type="number"
              placeholder="Example: Mendoza"
            />
          </VCol>

          <VCol cols="4">
            <VTextField
              v-model="form.birthday"
              label="Cumpleaños"
              type="date"
              placeholder="Selecciona fecha"
            />
          </VCol>
          <VCol cols="4">
            <VRadioGroup
              v-model="form.gender"
              inline
            >
              <VRadio
                label="Masculino"
                value="M"
              />
              <VRadio
                label="Femenino"
                value="F"
              />
            </VRadioGroup>
          </VCol>
          <VCol cols="4">
            <VTextarea
              v-model="form.designation"
              label="Designación"
              placeholder="Text"
            />
          </VCol>
          <VCol cols="6">
            <VRow>
              <VCol cols="12">
                <VFileInput
                  label="Cargar Archivo"
                  @change="loadFile($event)"
                />
              </VCol>
              <VCol
                v-if="IMAGEN_PREVIZUALIZA"
                cols="12"
              >
                <div
                  class="border rounded d-flex align-center justify-center p-1"
                  style="width: 150px; height: 180px; background: #2f3349; overflow: hidden;"
                >
                  <img
                    :src="IMAGEN_PREVIZUALIZA"
                    style="width: 100%; height: 100%; object-fit: cover;"
                  >
                </div>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="6">
            <VSelect
              v-model="form.role_id"
              :items="roles"
              label="Rol"
              item-title="name"
              item-value="id"
              placeholder="Select Rol"
              eager
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="johndoe@email.com"
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.password"
              label="Password"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="pa-5 py-0">
        <VBtn
          color="primary"
          class="mb-4"
          @click="store"
        >
          Crear
        </VBtn>
      </VCardText>

      <VCardText class="pa-5">
        {{ selected_segment_time }}
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                DIAS/HORAS
              </th>

              <th
                v-for="(day, index) in days"
                :key="index"
                class="text-uppercase"
              >
                {{ day }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in hour_days"
              :key="item.hour"
            >
              <td>
                {{ item.hour_format }}
                <VCheckbox
                  v-if="!load_request"
                  label="Todos"
                  @click="selectSegmentTimeAllGroups($event, item.segments_time)"
                />
              </td>

              <td
                v-for="(day, index) in days"
                :key="index"
              >
                <div class="demo-space-x my-2">
                  <VCheckbox
                    v-if="!load_request"
                    label="Todos"
                    @click="selectSegmentTimeAll($event, item.segments_time, day)"
                  />
                  <template
                    v-for="(segment_time, index) in item.segments_time"
                    :key="index"
                  >
                    <VCheckbox
                      v-model="selected_segment_time"
                      :label="segment_time.hour_start_format + ' ' + segment_time.hour_end_format"
                      :value="segment_time.id + '-' + day"
                      @click="selectedSegmentTime($event, segment_time, day)"
                    />
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>

<style>
.v-selection-control .v-label {
    font-size: small;
}

.v-checkbox.v-input {
    margin: 0;
}
</style>