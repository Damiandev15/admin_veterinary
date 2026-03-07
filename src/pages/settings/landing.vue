<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'

const sections = ref([])
const loading = ref(false)

const fetchSections = async () => {
  try {
    const resp = await $api('/landing-sections', { method: 'GET' })

    sections.value = resp.sections
  } catch (error) {
    console.error(error)
  }
}

const editSection = ref({
  section_key: '',
  title: '',
  subtitle: '',
  description: '',
  order: 0,
})

const imageFile = ref(null)
const isEditing = ref(false)

const openEdit = (section = null) => {
  if (section) {
    editSection.value = { ...section }
    isEditing.value = true
  } else {
    editSection.value = {
      section_key: '',
      title: '',
      subtitle: '',
      description: '',
      order: 0,
    }
    isEditing.value = false
  }
}

const saveSection = async () => {
  loading.value = true
  try {
    const formData = new FormData()

    formData.append('section_key', editSection.value.section_key)
    formData.append('title', editSection.value.title || '')
    formData.append('subtitle', editSection.value.subtitle || '')
    formData.append('description', editSection.value.description || '')
    formData.append('order', editSection.value.order || 0)

    if (imageFile.value) {
      formData.append('image_file', imageFile.value)
    }

    await $api('/landing-sections', {
      method: 'POST',
      body: formData,
    })

    Swal.fire('Éxito', 'Sección guardada correctamente', 'success')
    fetchSections()
    isEditing.value = false
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo guardar la sección', 'error')
  } finally {
    loading.value = false
  }
}

const deleteSection = async id => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (result.isConfirmed) {
    try {
      await $api(`/landing-sections/${id}`, { method: 'DELETE' })
      Swal.fire('Eliminado', 'Sección eliminada', 'success')
      fetchSections()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo eliminar', 'error')
    }
  }
}

onMounted(() => {
  fetchSections()
})

definePage({
  meta: {
    permisssion: 'manage_settings',
  },
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Gestión de Landing Page">
        <VCardText>
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-body-2 text-secondary">
              <strong>Keys comunes:</strong> <VChip
                size="small"
                class="me-1"
              >
                navbar
              </VChip> <VChip
                size="small"
                class="me-1"
              >
                hero
              </VChip> <VChip
                size="small"
                class="me-1"
              >
                feature1
              </VChip> <VChip
                size="small"
                class="me-1"
              >
                cta
              </VChip> <VChip size="small">
                footer
              </VChip><br>
              Usa <em>Subtítulo</em> para íconos (ej. <code>ri-heart-fill</code>). La imagen cargada reemplazará al ícono o fondo dependiento la sección.
            </div>
            <VBtn
              color="primary"
              @click="openEdit"
            >
              Nueva Sección
            </VBtn>
          </div>

          <VTable>
            <thead>
              <tr>
                <th>Key</th>
                <th>Título</th>
                <th>Orden</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="section in sections"
                :key="section.id"
              >
                <td>{{ section.section_key }}</td>
                <td>{{ section.title }}</td>
                <td>{{ section.order }}</td>
                <td>
                  <VImg
                    v-if="section.image_url"
                    :src="section.image_url"
                    width="50"
                    height="50"
                    cover
                  />
                </td>
                <td>
                  <VBtn
                    icon
                    size="small"
                    color="info"
                    class="me-2"
                    @click="openEdit(section)"
                  >
                    <VIcon icon="ri-edit-line" />
                  </VBtn>
                  <VBtn
                    icon
                    size="small"
                    color="error"
                    @click="deleteSection(section.id)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>

    <VDialog
      v-model="isEditing"
      max-width="600"
    >
      <VCard :title="editSection.id ? 'Editar Sección' : 'Nueva Sección'">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="editSection.section_key"
                label="Key (hero, about, info...)"
                placeholder="Ej: hero"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="editSection.title"
                label="Título"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="editSection.subtitle"
                label="Subtítulo"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="editSection.description"
                label="Descripción"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="editSection.order"
                label="Orden"
                type="number"
              />
            </VCol>
            <VCol cols="12">
              <VFileInput
                label="Imagen (Logo, Fondo, o Principal)"
                accept="image/*"
                @change="e => imageFile.value = e.target.files[0]"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            @click="isEditing = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="loading"
            @click="saveSection"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VRow>
</template>
