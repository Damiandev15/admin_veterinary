<script setup>
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  sku: '',
  category: '',
  brand: '',
  cost_price: 0,
  sale_price: 0,
  stock: 0,
  min_stock: 5,
  expiry_date: null,
  content_detail: '',
})

const categories = [
  { title: 'Medicina', value: 'medicina' },
  { title: 'Alimento', value: 'alimento' },
  { title: 'Accesorio', value: 'accesorio' },
]

const FILE_IMAGE = ref(null)
const IMAGE_PREVIEW = ref(null)

const loadFile = $event => {
  const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event)

  if (!file) return

  if (file.type.indexOf("image") < 0) {
    FILE_IMAGE.value = null
    IMAGE_PREVIEW.value = null
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
    })
    
    return
  }

  FILE_IMAGE.value = file
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = () => {
    IMAGE_PREVIEW.value = reader.result
  }
}

const removeImage = () => {
  FILE_IMAGE.value = null
  IMAGE_PREVIEW.value = null
}

const showExpiryDate = () => {
  return form.value.category === 'medicina' || form.value.category === 'alimento'
}

const resetForm = () => {
  form.value = {
    name: '',
    sku: '',
    category: '',
    brand: '',
    cost_price: 0,
    sale_price: 0,
    stock: 0,
    min_stock: 5,
    expiry_date: null,
    content_detail: '',
  }
  FILE_IMAGE.value = null
  IMAGE_PREVIEW.value = null
}

const saveProduct = async () => {
  try {
    if (!form.value.name || !form.value.category || !form.value.sale_price) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Complete los campos obligatorios: Nombre, Categoría y Precio de Venta',
      })
      
      return
    }

    if (showExpiryDate() && !form.value.expiry_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'La fecha de vencimiento es obligatoria para medicinas y alimentos',
      })
      
      return
    }

    let formData = new FormData()
    formData.append("name", form.value.name)
    if (form.value.sku) formData.append("sku", form.value.sku)
    formData.append("category", form.value.category)
    if (form.value.brand) formData.append("brand", form.value.brand)
    formData.append("cost_price", form.value.cost_price)
    formData.append("sale_price", form.value.sale_price)
    formData.append("stock", form.value.stock)
    formData.append("min_stock", form.value.min_stock)
    if (form.value.expiry_date) formData.append("expiry_date", form.value.expiry_date)
    if (form.value.content_detail) formData.append("content_detail", form.value.content_detail)
    if (FILE_IMAGE.value) formData.append("image", FILE_IMAGE.value)

    await $api('/inventory', {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response._data?.message || 'Error al guardar el producto',
        })
      },
    })

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Producto creado correctamente',
      showConfirmButton: false,
      timer: 1500,
    })

    setTimeout(() => {
      router.push({ name: 'inventory-list' })
    }, 1500)

    resetForm()

  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.data?.message || 'Ocurrió un error inesperado',
    })
  }
}

definePage({
  meta: {
    permission: 'all',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-4">
        <h4 class="text-h4 text-center mb-1">
          📦 Registrar Producto
        </h4>
        <p class="text-center text-disabled">
          Complete los datos del nuevo producto para el inventario
        </p>
      </div>
    </VCardText>

    <VCard
      title="📋 Información del Producto"
      class="pa-4"
    >
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.name"
            label="Nombre del Producto *"
            placeholder="Ej: Vacuna Antirrábica"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.sku"
            label="SKU / Código de Barras"
            placeholder="Opcional"
          />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <VSelect
            v-model="form.category"
            :items="categories"
            label="Categoría *"
            placeholder="Seleccione una categoría"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VTextField
            v-model="form.brand"
            label="Marca"
            placeholder="Ej: Zoetis, Royal Canin"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VTextField
            v-model="form.content_detail"
            label="Detalle de Contenido"
            placeholder="Ej: 500ml, 1kg, 10 tabletas"
          />
        </VCol>
      </VRow>
    </VCard>

    <VCard
      title="💰 Precios y Stock"
      class="my-4 pa-4"
    >
      <VRow>
        <VCol
          cols="12"
          md="3"
        >
          <VTextField
            v-model="form.cost_price"
            label="Precio de Costo (Bs.)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VTextField
            v-model="form.sale_price"
            label="Precio de Venta (Bs.) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VTextField
            v-model="form.stock"
            label="Stock Inicial *"
            type="number"
            min="0"
            placeholder="0"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VTextField
            v-model="form.min_stock"
            label="Stock Mínimo"
            type="number"
            min="0"
            placeholder="5"
          />
        </VCol>

        <VCol
          v-if="showExpiryDate()"
          cols="12"
          md="6"
        >
          <label>Fecha de Vencimiento *</label>
          <div class="app-picker-field">
            <div class="v-input v-input--horizontal v-input--center-affix v-input--density-comfortable v-locale--is-ltr position-relative v-text-field">
              <div class="v-input__control">
                <div class="v-field v-field--center-affix v-field--variant-outlined v-theme--light v-locale--is-ltr">
                  <div class="v-field__field">
                    <div class="v-field__input">
                      <input
                        v-model="form.expiry_date"
                        type="date"
                        class="flat-picker-custom-style flatpickr-input"
                        style="opacity: 1;"
                      >
                    </div>
                  </div>
                  <div class="v-field__outline text-primary">
                    <div class="v-field__outline__start" />
                    <div class="v-field__outline__notch" />
                    <div class="v-field__outline__end" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCard>

    <VCard
      title="🖼️ Imagen del Producto"
      class="my-4 pa-4"
    >
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VFileInput
            label="Imagen del Producto"
            accept=".jpg,.jpeg,.png"
            prepend-icon="ri-image-add-line"
            @change="loadFile($event)"
          />
          <p class="text-caption text-disabled mt-2">
            Formatos permitidos: JPG, JPEG, PNG. Tamaño máximo: 2MB
          </p>
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <div
            class="border rounded d-flex align-center justify-center p-1 position-relative"
            style="min-height: 200px; background: #2f3349; overflow: hidden;"
          >
            <img
              v-if="IMAGE_PREVIEW"
              :src="IMAGE_PREVIEW"
              style="width: 100%; height: 200px; object-fit: cover;"
              class="rounded"
            >
            <div
              v-else
              class="text-center"
            >
              <VIcon
                icon="ri-image-line"
                size="48"
                class="text-disabled mb-2"
              />
              <p class="text-disabled">
                Sin imagen
              </p>
            </div>
            <span
              v-if="IMAGE_PREVIEW"
              class="position-absolute cursor-pointer text-white"
              style="top: 5px; right: 8px; font-size: 24px; text-shadow: 0 0 3px rgba(0,0,0,0.8); z-index: 10; line-height: 1;"
              @click="removeImage"
            >×</span>
          </div>
        </VCol>
      </VRow>
    </VCard>

    <VCardText class="pa-5 py-0 d-flex justify-space-between">
      <VBtn
        color="secondary"
        variant="outlined"
        @click="router.push({ name: 'inventory-list' })"
      >
        <VIcon
          icon="ri-arrow-left-line"
          class="me-2"
        />
        Cancelar
      </VBtn>
      <VBtn
        color="primary"
        @click="saveProduct"
      >
        <VIcon
          icon="ri-save-line"
          class="me-2"
        />
        Guardar Producto
      </VBtn>
    </VCardText>
  </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.app-picker-field {
    margin-top: 8px;
}
</style>
