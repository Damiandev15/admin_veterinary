<script setup>
import Swal from 'sweetalert2'


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roles: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'addUser'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

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
}

const store = async () => {
  if (!form.value.name) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el nombre del usuario" })
    
    return
  }
  if (!form.value.surname) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el apellido del usuario" })
    
    return
  }
  if (!form.value.email) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el email del usuario" })
    
    return
  }
  if (!form.value.phone) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el telefono del usuario" })
    
    return
  }
  if (!form.value.gender) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el genero del usuario" })
    
    return
  }
  if (!FILE_AVATAR.value) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un avatar para el usuario" })
    
    return
  }
  if (!form.value.role_id) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un rol para el usuario" })
    
    return
  }
  if (!form.value.password) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe digitar una contraseña para el usuario" })
    
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
  try {
    const resp = await $api('/staffs', {
      method: 'POST',
      body: formData,
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
        text: 'El usuario se ha creado correctamente',
        showConfirmButton: false,
        timer: 1500,
      })
      fieldsClean()
      emit('update:isDialogVisible', false)
      emit('addUser', resp.user)
    }

  } catch (error) {
    console.log(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' })
  }

}

const loadFile = $event => {
  const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event)

  if (!file) return

  if (file.type.indexOf("image") < 0) {
    FILE_AVATAR.value = null
    IMAGEN_PREVIZUALIZA.value = null
    Swal.fire({ icon: 'error', title: 'Error', text: "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN" })
    
    return
  }


  // warning.value = '';

  FILE_AVATAR.value = file
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = () => {
    IMAGEN_PREVIZUALIZA.value = reader.result
  }
}


onMounted(() => {
  roles.value = props.roles
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="750"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Agregar Personal
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
              label="N° documento (Cédula):"
              type="number"
              placeholder="Ej: 12345678"
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
                  label="Foto del Personal"
                  accept=".jpg,.jpeg,.png"
                  @change="loadFile($event)"
                />
              </VCol>
              <VCol
                v-if="IMAGEN_PREVIZUALIZA"
                cols="12"
              >
                <div
                  class="border rounded d-flex align-center justify-center p-1"
                  style="min-height: 180px; background: #2f3349; overflow: hidden; width: 150px;"
                >
                  <img
                    :src="IMAGEN_PREVIZUALIZA"
                    style="width: 100%; height: 180px; object-fit: cover;"
                    class="rounded"
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
      <VCardText class="pa-5">
        <VBtn
          color="primary"
          class="mb-4"
          @click="store"
        >
          Crear
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
