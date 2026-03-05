<script setup>
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  petId: null,
  groomingCutType: null,
  groomingFaceStyle: null,
  groomingObservations: null,
  groomingServices: [],
})

const groomingCutTypes = ['Bajo', 'Medio', 'Alto']
const groomingFaceStyles = ['Redonda', 'Cuadrada']

const groomingServicesList = [
  { title: 'Oídos', value: 'Oídos' },
  { title: 'Uñas', value: 'Uñas' },
  { title: 'Higiénico', value: 'Higiénico' },
]

const fileGrooming = ref([])
const imageGroomingPreview = ref([])
const petsList = ref([])
const searchPet = ref('')

const loadFileGrooming = $event => {
  const files = Array.from($event.target.files)
  if (files.some(file => file.type.indexOf('image') < 0)) {
    fileGrooming.value = []
    imageGroomingPreview.value = []
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
    })

    return
  }

  const totalPhotos = imageGroomingPreview.value.length + files.length
  if (totalPhotos > 5) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'SOLAMENTE SE PERMITEN HASTA 5 FOTOS EN TOTAL',
    })

    return
  }

  fileGrooming.value = [...fileGrooming.value, ...files]

  files.forEach(file => {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onloadend = () => imageGroomingPreview.value.push(reader.result)
  })
}

const removeGroomingPhoto = index => {
  imageGroomingPreview.value.splice(index, 1)
  if (fileGrooming.value.length > index) {
    const newFiles = Array.from(fileGrooming.value)

    newFiles.splice(index, 1)
    fileGrooming.value = newFiles
  }
}

const filterPets = async val => {
  if (!val)
    return

  try {
    const resp = await $api(`/appointments/search-pets/${val}`, {
      method: 'GET',
    })

    // The API returns { pets: [...] }
    petsList.value = resp.pets.map(pet => ({
      title: `${pet.name} - ${pet.owner ? `${pet.owner.first_name} ${pet.owner.last_name || ''}` : ''}`,
      value: pet.id,
      ...pet,
    }))
  } catch (error) {
    console.error(error)
  }
}

watch(searchPet, val => {
  if (val && val.length > 2) {
    filterPets(val)
  }
})

const fieldsClean = () => {
  form.value.petId = null
  form.value.groomingCutType = null
  form.value.groomingFaceStyle = null
  form.value.groomingObservations = null
  form.value.groomingServices = []
  fileGrooming.value = []
  imageGroomingPreview.value = []
  petsList.value = []
  searchPet.value = ''
}

const store = async () => {
  try {
    if (!form.value.petId) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe seleccionar una mascota',
      })

      return
    }

    const formData = new FormData()

    formData.append('pet_id', form.value.petId)

    if (form.value.groomingCutType)
      formData.append('grooming_cut_type', form.value.groomingCutType)
    if (form.value.groomingFaceStyle)
      formData.append('grooming_face_style', form.value.groomingFaceStyle)
    if (form.value.groomingObservations)
      formData.append('grooming_observations', form.value.groomingObservations)

    formData.append('grooming_services', JSON.stringify(form.value.groomingServices))

    if (fileGrooming.value.length > 0) {
      fileGrooming.value.forEach(file => {
        formData.append('grooming_photos_file[]', file)
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
          text: 'En el servidor hubo un error al guardar',
        })
      },
    })

    console.log(resp)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'La información de peluquería se ha guardado correctamente',
      showConfirmButton: false,
      timer: 1500,
    })

    setTimeout(() => {
      router.push({ name: 'grooming-list' })
    }, 1500)

    fieldsClean()
  } catch (error) {
    console.log(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado',
    })
  }
}

definePage({
  meta: {
    permisssion: 'register_pet',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Registrar Peluquería ✂️
        </h4>
      </div>
    </VCardText>

    <VCard
      title="🐕 Seleccionar Mascota:"
      class="pa-4 mb-4"
    >
      <VRow>
        <VCol cols="12">
          <VAutocomplete
            v-model="form.petId"
            v-model:search="searchPet"
            :items="petsList"
            label="Buscar Mascota (Nombre, Propietario, Documento)"
            placeholder="Escriba para buscar..."
            item-title="title"
            item-value="value"
            :return-object="false"
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
            v-model="form.groomingCutType"
            :items="groomingCutTypes"
            label="Tipo de Corte"
            placeholder="Seleccionar"
          />
        </VCol>
        <VCol cols="6">
          <VSelect
            v-model="form.groomingFaceStyle"
            :items="groomingFaceStyles"
            label="Estilo de Cara"
            placeholder="Seleccionar"
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="form.groomingObservations"
            label="Observaciones de Peluquería"
            placeholder="..."
          />
        </VCol>
        <VCol cols="12">
          <label class="d-block mb-2">Servicios Adicionales:</label>
          <div class="d-flex gap-4">
            <VCheckbox
              v-for="service in groomingServicesList"
              :key="service.value"
              v-model="form.groomingServices"
              :label="service.title"
              :value="service.value"
              inline
            />
          </div>
        </VCol>
        <VCol cols="4">
          <VFileInput
            label="Fotos Grooming (Hasta 5)"
            accept=".jpg,.jpeg,.png"
            multiple
            @change="loadFileGrooming($event)"
          />
        </VCol>
        <VCol
          cols="12"
          class="d-flex flex-wrap gap-2"
        >
          <div
            v-for="(img, index) in imageGroomingPreview"
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
            >
              ×
            </span>
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
        Guardar
      </VBtn>
    </VCardText>
  </div>
</template>
