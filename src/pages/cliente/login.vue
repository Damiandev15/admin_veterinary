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

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const loading = ref(false)

const login = async () => {
    loading.value = true
    try {
        const resp = await $clientApi('/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        })

        localStorage.setItem('client_token', resp.access_token)
        localStorage.setItem('client_data', JSON.stringify(resp.client))

        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Acceso concedido al portal de clientes.',
            timer: 1500,
            showConfirmButton: false,
        }).then(() => {
            window.location.href = '/cliente/agenda'
        })
    } catch (error) {
        console.error(error)
        Swal.fire({ icon: 'error', title: 'Error', text: 'Credenciales inválidas o error de conexión.' })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="client-auth-wrapper d-flex align-center justify-center pa-4">
        <VCard class="client-auth-card pa-8" max-width="450" width="100%">
            <div class="text-center mb-8">
                <h2 class="text-h4 font-weight-bold text-primary mb-2">Portal Clientes</h2>
                <p class="text-body-1 text-disabled">Bienvenido, por favor inicia sesión</p>
            </div>

            <VForm @submit.prevent="login">
                <VRow>
                    <VCol cols="12">
                        <VTextField v-model="email" label="Email" type="email" placeholder="email@ejemplo.com"
                            required />
                    </VCol>

                    <VCol cols="12">
                        <VTextField v-model="password" label="Contraseña"
                            :type="isPasswordVisible ? 'text' : 'password'"
                            :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                            @click:append-inner="isPasswordVisible = !isPasswordVisible" required />
                    </VCol>

                    <VCol cols="12" class="mt-4">
                        <VBtn block color="primary" size="large" type="submit" :loading="loading">
                            Iniciar Sesión
                        </VBtn>
                    </VCol>

                    <VCol cols="12" class="text-center">
                        <span>¿Nuevo por aquí?</span>
                        <a href="/cliente/register" class="text-primary ms-2 font-weight-medium">Regístrate ahora</a>
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
</style>
