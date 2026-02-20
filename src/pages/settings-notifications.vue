<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted, watch } from 'vue';

const loading = ref(false);
const saving = ref(false);
const testing = ref(false);

const showSid = ref(false);
const showToken = ref(false);

const settings = ref({
    ultramsg_instance_id: '',
    ultramsg_token: '',
    appointment_reminder_template: '',
    appointment_confirmation_template: '',
    pet_ready_template: '',
    whatsapp_enabled: false,
});

const testPhone = ref('');

const pets_list = ref([]);
const search_pet_query = ref('');
const selected_pet_search = ref(null);

const newContact = ref({
    first_name: '',
    last_name: '',
    phone: '+58'
});

const searchPetsList = async () => {
    try {
        const resp = await $api(`/owners/search`, {
            method: 'GET',
            params: { search: search_pet_query.value || '' }
        });
        pets_list.value = resp.owners;
    } catch (error) {
        console.error(error);
    }
}

const saveContact = async () => {
    if (!newContact.value.first_name || !newContact.value.phone) {
        Swal.fire('Atención', 'Nombre y Teléfono son obligatorios', 'warning');
        return;
    }

    try {
        const resp = await $api('/owners', {
            method: 'POST',
            body: newContact.value
        });

        Swal.fire({ icon: 'success', title: '¡Perfecto!', text: 'Contacto guardado en tu agenda', timer: 1500, showConfirmButton: false });

        // Seleccionar automáticamente el nuevo contacto en el buscador
        selected_pet_search.value = resp.owner;
        testPhone.value = resp.owner.phone;

        // Actualizar la lista para que aparezca en el select
        searchPetsList();

        // Limpiar form
        newContact.value = { first_name: '', last_name: '', phone: '+58' };
    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.data?.message || 'No se pudo guardar el contacto', 'error');
    }
}

watch(search_pet_query, (val) => {
    if (val && val.length > 0) {
        searchPetsList();
    }
});

watch(selected_pet_search, (val) => {
    if (val) {
        testPhone.value = val.phone;
    }
});

const loadSettings = async () => {
    loading.value = true;
    try {
        const resp = await $api('/settings/notifications', {
            method: 'GET',
        });

        settings.value = {
            ultramsg_instance_id: resp.settings.ultramsg_instance_id?.value || '',
            ultramsg_token: resp.settings.ultramsg_token?.value || '',
            appointment_reminder_template: resp.settings.appointment_reminder_template?.value || '',
            appointment_confirmation_template: resp.settings.appointment_confirmation_template?.value || '',
            pet_ready_template: resp.settings.pet_ready_template?.value || '',
            whatsapp_enabled: resp.settings.whatsapp_enabled?.value === '1',
        };
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar las configuraciones',
        });
    } finally {
        loading.value = false;
    }
    // Cargar contactos iniciales para el select
    searchPetsList();
};

const saveSettings = async () => {
    saving.value = true;
    try {
        await $api('/settings/notifications', {
            method: 'POST',
            body: JSON.stringify(settings.value),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Configuraciones guardadas correctamente',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || 'Error al guardar las configuraciones',
        });
    } finally {
        saving.value = false;
    }
};

const getPreviewMessage = (type) => {
    let template = '';
    if (type === 'confirmation') {
        template = settings.value.appointment_confirmation_template;
    } else if (type === 'reminder') {
        template = settings.value.appointment_reminder_template;
    } else if (type === 'pet_ready') {
        template = settings.value.pet_ready_template;
    }

    if (!template) return '';

    return template
        .replace('{nombre}', 'Maria Pérez')
        .replace('{fecha}', '25/01/2026')
        .replace('{hora}', '10:00 AM')
        .replace('{mascota}', 'Luna');
};

const testWhatsApp = async (type = 'confirmation') => {
    if (!testPhone.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, ingrese un número de teléfono',
        });
        return;
    }

    const message = getPreviewMessage(type);
    if (!message) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'La plantilla seleccionada está vacía.',
        });
        return;
    }

    testing.value = true;
    try {
        const resp = await $api('/settings/test-whatsapp', {
            method: 'POST',
            body: JSON.stringify({
                phone_number: testPhone.value,
                message: message
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (resp.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Mensaje Enviado!',
                text: 'El mensaje se ha enviado correctamente.',
                showConfirmButton: false,
                timer: 2000
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al Enviar',
                text: resp.message || 'No se pudo enviar el mensaje',
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            html: `
                <p>${error.data?.message || 'Error al enviar el mensaje'}</p>
                ${error.data?.error ? `<p class="text-caption text-error">${error.data.error}</p>` : ''}
            `,
        });
    } finally {
        testing.value = false;
    }
};

onMounted(() => {
    loadSettings();
});

definePage({
    meta: {
        permission: 'all'
    },
});
</script>

<template>
    <div>
        <VCardText class="pa-5">
            <div class="mb-4">
                <h4 class="text-h4 mb-1">
                    📱 Configuración de Notificaciones WhatsApp (UltraMsg)
                </h4>
                <p class="text-disabled">Configure las credenciales de UltraMsg para enviar notificaciones automáticas
                </p>
            </div>
        </VCardText>

        <div v-if="loading" class="text-center py-10">
            <VProgressCircular indeterminate color="primary" size="64" />
        </div>

        <div v-else>
            <!-- Tarjeta 1: Credenciales Twilio -->
            <!-- Tarjeta 1: Credenciales UltraMsg -->
            <VCard title="🔐 Credenciales de UltraMsg" class="mb-4 pa-4">
                <VRow>
                    <VCol cols="12">
                        <VSwitch v-model="settings.whatsapp_enabled" label="Activar Notificaciones de WhatsApp"
                            color="primary" hide-details />
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField v-model="settings.ultramsg_instance_id" label="Instance ID *"
                            placeholder="instance12345" :type="showSid ? 'text' : 'password'"
                            :append-inner-icon="showSid ? 'ri-eye-off-line' : 'ri-eye-line'"
                            @click:append-inner="showSid = !showSid" />
                        <p class="text-caption text-disabled mt-1">
                            Obténlo en tu <a href="https://ultramsg.com/panel/" target="_blank"
                                class="text-primary">Dashboard de UltraMsg</a>
                        </p>
                    </VCol>

                    <VCol cols="12" md="6">
                        <VTextField v-model="settings.ultramsg_token" label="Token *" placeholder="xxxxxxxxxxxxxxxx"
                            :type="showToken ? 'text' : 'password'"
                            :append-inner-icon="showToken ? 'ri-eye-off-line' : 'ri-eye-line'"
                            @click:append-inner="showToken = !showToken" />
                        <p class="text-caption text-disabled mt-1">
                            Token de autenticación de tu instancia
                        </p>
                    </VCol>
                </VRow>
            </VCard>

            <!-- Tarjeta 2: Personalización de Mensajes -->
            <VCard title="✏️ Personalización de Mensajes" class="mb-4 pa-4">
                <VRow>
                    <VCol cols="12">
                        <VTextarea v-model="settings.appointment_confirmation_template"
                            label="Plantilla de Confirmación de Citas (Al crear)"
                            placeholder="Hola {nombre}, tu cita ha sido confirmada..." rows="3" class="mb-4" />

                        <VTextarea v-model="settings.appointment_reminder_template"
                            label="Plantilla de Recordatorio de Citas (Día previo)"
                            placeholder="Hola {nombre}, recordamos tu cita..." rows="3" class="mb-4" />

                        <VTextarea v-model="settings.pet_ready_template"
                            label="Plantilla de Mascota Lista (Peluquería/Grooming)"
                            placeholder="Hola {nombre}, tu mascota {mascota} ya está lista..." rows="3" />
                        <div class="mt-2">
                            <p class="text-caption text-disabled mb-2">
                                <strong>Variables disponibles:</strong>
                            </p>
                            <div class="d-flex flex-wrap gap-2">
                                <VChip size="small" color="primary" variant="outlined">
                                    {nombre}
                                </VChip>
                                <VChip size="small" color="primary" variant="outlined">
                                    {fecha}
                                </VChip>
                                <VChip size="small" color="primary" variant="outlined">
                                    {hora}
                                </VChip>
                                <VChip size="small" color="primary" variant="outlined">
                                    {mascota}
                                </VChip>
                            </div>
                            <p class="text-caption text-disabled mt-2">
                                Estas variables serán reemplazadas automáticamente con los datos de la cita
                            </p>
                        </div>
                    </VCol>
                </VRow>
            </VCard>

            <!-- Tarjeta 3: Registro de Contacto Rápido -->
            <VCard title="💾 Registrar Contacto Frecuente" class="mb-4 pa-4 shadow-sm">
                <VRow>
                    <VCol cols="12">
                        <p class="text-caption text-disabled mb-4">
                            Guarda contactos que no tengan mascotas registradas para enviarles mensajes rápidamente.
                        </p>
                    </VCol>
                    <VCol cols="12" md="4">
                        <VTextField v-model="newContact.first_name" label="Nombre *" placeholder="Ej: Juan"
                            density="compact" />
                    </VCol>
                    <VCol cols="12" md="4">
                        <VTextField v-model="newContact.last_name" label="Apellido" placeholder="Ej: Pérez"
                            density="compact" />
                    </VCol>
                    <VCol cols="12" md="4">
                        <VTextField v-model="newContact.phone" label="Teléfono (WhatsApp) *" placeholder="+58..."
                            density="compact" />
                    </VCol>
                    <VCol cols="12" class="text-end">
                        <VBtn :color="newContact.first_name && newContact.phone.length > 3 ? 'primary' : 'secondary'"
                            variant="elevated" @click="saveContact">
                            <VIcon icon="ri-user-add-line" class="me-2" />
                            Guardar en Agenda
                        </VBtn>
                    </VCol>
                </VRow>
            </VCard>

            <!-- Tarjeta 4: Envío de Mensajes Manuales -->
            <VCard title="📤 Envío de Mensajes Manuales" class="mb-4 pa-4 shadow-sm">
                <VRow>
                    <VCol cols="12">
                        <VAlert type="info" variant="tonal" class="mb-4 border-sm">
                            <strong>Importante:</strong> El campo de teléfono es automático. Busca un contacto guardado
                            arriba o usa el formulario de registro rápido.
                        </VAlert>
                    </VCol>

                    <VCol cols="12" md="6">
                        <div class="mb-2 text-subtitle-2 text-primary">1. Buscar Contacto</div>
                        <VAutocomplete v-model="selected_pet_search" v-model:search="search_pet_query"
                            :items="pets_list" item-title="first_name" return-object label="Nombre o Teléfono..."
                            placeholder="Escribe para buscar..." prepend-inner-icon="ri-search-line" density="compact"
                            class="mb-4" clearable hide-no-data variant="outlined">
                            <template #item="{ props, item }">
                                <VListItem v-bind="props">
                                    <template #title>
                                        <span class="font-weight-bold">{{ item.raw.first_name }} {{ item.raw.last_name
                                            || '' }}</span>
                                    </template>
                                    <template #subtitle>
                                        <VIcon icon="ri-whatsapp-line" size="14" class="me-1 text-success" />
                                        <span>{{ item.raw.phone }}</span>
                                    </template>
                                </VListItem>
                            </template>
                        </VAutocomplete>

                        <div class="mb-2 text-subtitle-2 text-primary">2. Número Destinatario</div>
                        <VTextField v-model="testPhone" label="Teléfono Seleccionado" readonly
                            prepend-inner-icon="ri-phone-line" class="bg-light" variant="filled" />
                        <p class="text-caption text-disabled mt-1 italic">
                            * Solo lectura. Selecciona un contacto arriba para cambiar el número.
                        </p>
                    </VCol>

                    <VCol cols="12" md="6" class="d-flex flex-column align-end">
                        <div class="mb-2 text-subtitle-2 text-primary align-self-start">3. Acción de Envío</div>
                        <VBtn color="primary" @click="testWhatsApp('confirmation')" :loading="testing"
                            :disabled="!testPhone" block class="mb-2 py-6">
                            <VIcon icon="ri-send-plane-line" class="me-2" />
                            Enviar Confirmación
                        </VBtn>
                        <VBtn color="info" @click="testWhatsApp('reminder')" :loading="testing" :disabled="!testPhone"
                            block class="mb-2 py-6">
                            <VIcon icon="ri-time-line" class="me-2" />
                            Enviar Recordatorio
                        </VBtn>
                        <VBtn color="success" @click="testWhatsApp('pet_ready')" :loading="testing"
                            :disabled="!testPhone" block class="py-6">
                            <VIcon icon="ri-check-double-line" class="me-2" />
                            Avisar: Mascota Lista
                        </VBtn>
                    </VCol>
                </VRow>
            </VCard>

            <!-- Botones de Acción -->
            <VCardText class="pa-5 py-0 text-end">
                <VBtn color="primary" @click="saveSettings" :loading="saving" size="large">
                    <VIcon icon="ri-save-line" class="me-2" />
                    Guardar Configuración
                </VBtn>
            </VCardText>
        </div>
    </div>
</template>

<style scoped>
.gap-2 {
    gap: 8px;
}

code {
    background-color: rgba(var(--v-theme-primary), 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
}
</style>
