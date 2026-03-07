<script setup>
import Swal from 'sweetalert2'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const form = ref({
  pet_id: null,
  grooming_cut_type: null,
  grooming_face_style: null,
  grooming_observations: null,
  grooming_services: [],
})

const grooming_cut_types = ['Bajo', 'Medio', 'Alto']
const grooming_face_styles = ['Redonda', 'Cuadrada']

const grooming_services_list = [
  { title: 'Oídos', value: 'Oídos' },
  { title: 'Uñas', value: 'Uñas' },
  { title: 'Higiénico', value: 'Higiénico' },
]

const FILE_GROOMING = ref([])
const IMAGEN_GROOMING_PREVIZUALIZA = ref([])
const searchPet = ref('')

const loadFileGrooming = $event => {
  const files = Array.from($event.target.files)
  if (files.some(file => file.type.indexOf("image") < 0)) {
    FILE_GROOMING.value = []
    IMAGEN_GROOMING_PREVIZUALIZA.value = []
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
    })
    
    return
  }

  const totalPhotos = IMAGEN_GROOMING_PREVIZUALIZA.value.length + files.length
  if (totalPhotos > 5) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'SOLAMENTE SE PERMITEN HASTA 5 FOTOS EN TOTAL',
    })
    
    return
  }

  FILE_GROOMING.value = [...FILE_GROOMING.value, ...files]

  files.forEach(file => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => IMAGEN_GROOMING_PREVIZUALIZA.value.push(reader.result)
  })
}

const removeGroomingPhoto = index => {
  IMAGEN_GROOMING_PREVIZUALIZA.value.splice(index, 1)
  if (FILE_GROOMING.value.length > index) {
    const newFiles = Array.from(FILE_GROOMING.value)

    newFiles.splice(index, 1)
    FILE_GROOMING.value = newFiles
  }
}

const showPet = async () => {
  try {
    const resp = await $api('/pets/' + route.params.id, {
      method: 'GET',
    })

    const pet = resp.pet

    form.value.pet_id = pet.id

    // Populate grooming data
    if (pet.grooming) {
      form.value.grooming_cut_type = pet.grooming.grooming_cut_type
      form.value.grooming_face_style = pet.grooming.grooming_face_style
      form.value.grooming_observations = pet.grooming.grooming_observations
      form.value.grooming_services = pet.grooming.grooming_services || []

      if (pet.grooming.grooming_photos && pet.grooming.grooming_photos.length > 0) {
        IMAGEN_GROOMING_PREVIZUALIZA.value = pet.grooming.grooming_photos
      }
    }

    searchPet.value = `${pet.name} - ${pet.owner ? pet.owner.first_name + ' ' + (pet.owner.last_name || '') : ''}`

  } catch (error) {
    console.log(error)
  }
}


const store = async () => {
  try {
    let formData = new FormData()
    formData.append("pet_id", form.value.pet_id)

    if (form.value.grooming_cut_type) formData.append("grooming_cut_type", form.value.grooming_cut_type)
    if (form.value.grooming_face_style) formData.append("grooming_face_style", form.value.grooming_face_style)
    if (form.value.grooming_observations) formData.append("grooming_observations", form.value.grooming_observations)

    formData.append("grooming_services", JSON.stringify(form.value.grooming_services))

    if (FILE_GROOMING.value.length > 0) {
      FILE_GROOMING.value.forEach(file => {
        formData.append("grooming_photos_file[]", file)
      })
    }

    const resp = await $api('/groomings', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'En el servidor hubo un error al actualizar',
        })
      },
    })

    console.log(resp)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'La información de peluquería se ha actualizado correctamente',
      showConfirmButton: false,
      timer: 1500,
    })

    setTimeout(() => {
      router.push({ name: 'grooming-list' })
    }, 1500)

  } catch (error) {
    console.log(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado',
    })
  }
}

onMounted(() => {
  showPet()
})

definePage({
  meta: {
    permission: 'register_pet',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Editar Peluquería ✂️
        </h4>
      </div>
    </VCardText>

    <VCard
      title="🐕 Mascota:"
      class="pa-4 mb-4"
    >
      <VRow>
        <VCol cols="12">
          <VTextField
            v-model="searchPet"
            label="Mascota"
            readonly
            disabled
          />
        </VCol>
      </VRow>
    </VCard>

    <!-- Peluquería y Estética -->
    <VCard
      title="✂️ Peluquería y Estética:"
      class="my-2 pa-4"
    >
      <VRow>
        <VCol cols="6">
          <VSelect
            v-model="form.grooming_cut_type"
            :items="grooming_cut_types"
            label="Tipo de Corte"
            placeholder="Seleccionar"
          />
        </VCol>
        <VCol cols="6">
          <VSelect
            v-model="form.grooming_face_style"
            :items="grooming_face_styles"
            label="Estilo de Cara"
            placeholder="Seleccionar"
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="form.grooming_observations"
            label="Observaciones de Peluquería"
            placeholder="..."
          />
        </VCol>
        <VCol cols="12">
          <label class="d-block mb-2">Servicios Adicionales:</label>
          <div class="d-flex gap-4">
            <VCheckbox
              v-for="service in grooming_services_list"
              :key="service.value"
              v-model="form.grooming_services"
              :label="service.title"
              :value="service.value"
              inline
            />
          </div>
        </VCol>
        <VCol cols="4">
          <VFileInput
            label="Fotos Grooming (Hasta 5)"
            multiple
            accept=".jpg,.jpeg,.png"
            @change="loadFileGrooming($event)"
          />
        </VCol>
        <VCol
          cols="12"
          class="d-flex flex-wrap gap-2"
        >
          <div
            v-for="(img, index) in IMAGEN_GROOMING_PREVIZUALIZA"
            :key="index"
            class="position-relative"
          >
            <img
              :src="img"
              style="width: 150px; height: 150px; object-fit: cover;"
              class="rounded border"
            >
            <span
              class="position-absolute cursor-pointer text-white"
              style="top: 5px; right: 8px; font-size: 24px; font-weight: bold; text-shadow: 0 0 3px rgba(0,0,0,0.8); z-index: 10; line-height: 1;"
              @click="removeGroomingPhoto(index)"
            >×</span>
          </div>
        </VCol>
      </VRow>
    </VCard>

    <VCardText class="pa-5 py-0 text-end">
      <VBtn
        color="primary"
        class="mb-4"
        @click="store"
      >
        Guardar Cambios
      </VBtn>
    </VCardText>
  </div>
</template>
