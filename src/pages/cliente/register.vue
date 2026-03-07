<script setup>
import { $clientApi } from '@/utils/clientApi'
import Swal from 'sweetalert2'

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
    public: true,
  },
})

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  address: '',
  city: '',
  type_document: 'Cédula de Identidad',
  n_document: '',
})

const type_documents = [
  'Cédula de Identidad',
  'PASAPORTE',
  'CARNET DE EXTRANJERIA',
]

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const loading = ref(false)

const register = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden' })
    
    return
  }

  loading.value = true
  try {
    const resp = await $clientApi('/register', {
      method: 'POST',
      body: form.value,
    })

    Swal.fire({
      icon: 'success',
      title: '¡Registro Exitoso!',
      text: 'Ahora puedes iniciar sesión para agendar tu cita.',
      showConfirmButton: true,
    }).then(() => {
      window.location.href = '/cliente/login'
    })
  } catch (error) {
    console.error(error)

    const errorMsg = error.response?._data?.message || 'Error al registrarse. Verifique los datos.'

    Swal.fire({ icon: 'error', title: 'Error', text: errorMsg })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="client-auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="client-auth-card pa-8"
      max-width="600"
      width="100%"
    >
      <div class="text-center mb-8">
        <h2 class="text-h4 font-weight-bold text-primary mb-2">
          Crear Cuenta
        </h2>
        <p class="text-body-1 text-disabled">
          Regístrate para gestionar las citas de tus mascotas
        </p>
      </div>

      <VForm @submit.prevent="register">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.first_name"
              label="Nombre"
              placeholder="Tu nombre"
              required
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.last_name"
              label="Apellido"
              placeholder="Tu apellido"
              required
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="email@ejemplo.com"
              required
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.phone"
              label="Teléfono"
              placeholder="Ej: +51 999 999 999"
              required
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VSelect
              v-model="form.type_document"
              :items="type_documents"
              label="Tipo de Documento"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.n_document"
              label="N° Documento"
              placeholder="Número de identidad"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="form.address"
              label="Dirección"
              placeholder="Tu domicilio"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.password"
              label="Contraseña"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              required
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.password_confirmation"
              label="Confirmar Contraseña"
              :type="isConfirmPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              required
              @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            />
          </VCol>

          <VCol
            cols="12"
            class="mt-4"
          >
            <VBtn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
            >
              Registrarse
            </VBtn>
          </VCol>

          <VCol
            cols="12"
            class="text-center"
          >
            <span>¿Ya tienes una cuenta?</span>
            <a
              href="/cliente/login"
              class="text-primary ms-2 font-weight-medium"
            >Inicia sesión aquí</a>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>

<style lang="scss">
.client-auth-wrapper {
    min-height: 100vh;
    background-color: #282c3e;
}

.client-auth-card {
    background-color: #2f3349 !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.text-primary {
    color: #666cff !important;
}

.v-btn--variant-elevated {
    box-shadow: 0 4px 14px 0 rgba(102, 108, 255, 0.39) !important;
}
</style>
