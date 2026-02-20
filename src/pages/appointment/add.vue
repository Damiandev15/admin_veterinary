<script setup>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const router = useRouter();


const form = ref({
    date_appointment: null,
    time: null,
    amount: 0,
    method_payment: 'DIVISAS',
    amount_add: 0,
})
const method_payments = ref([
    "DIVISAS",
    "PAGO MOVIL",
    "PUNTO DE VENTA",
    "TRANSFERENCIA",
    "ZELLE",
    "USDT"
]);
const veterinarie_id = ref(null);
const veterinaries = ref([]);
const reason = ref(null);

const reset = () => {
    form.value.date_appointment = null;
    form.value.time = null;
    veterinarie_id.value = null;
    reason.value = null;
}

const fieldsClean = () => {
    form.value.date_appointment = null;
    form.value.time = null;
    form.value.amount = 0;
    form.value.method_payment = 'DIVISAS';
    form.value.amount_add = 0;
    select_pet.value = null;
    reason.value = null;
    veterinarie_id.value = null;
}

const listVeterinaries = async () => {
    try {
        const resp = await $api('/veterinaries', {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
            }
        })
        veterinaries.value = resp.veterinaries.data;
    } catch (error) {
        console.log(error);
    }
}

const store = async () => {
    try {
        if (!form.value.date_appointment) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "El campo de fecha es requerido" });
            return;
        }
        if (!veterinarie_id.value) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es necesario seleccionar un veterinario" });
            return;
        }
        if (!reason.value) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido digitar una razon para la atención de la mascota" });
            return;
        }
        if (!select_pet.value) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido seleccionar una mascota" });
            return;
        }
        if (!form.value.amount) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar el costo de la cita medica" });
            return;
        }
        if (!form.value.amount_add) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar un adelanto del costo de la cita medica" });
            return;
        }
        if (parseInt(form.value.amount_add) > parseInt(form.value.amount)) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "El monto de adelanto no puede ser mayor al costo de la cita" });
            return;
        }

        let STATE_PAY = 1; // PENDIENTE
        if (form.value.amount > form.value.amount_add) {
            STATE_PAY = 2; // PARCIAL
        }
        if (form.value.amount == form.value.amount_add) {
            STATE_PAY = 3; // COMPLETO
        }
        let data = {
            veterinarie_id: veterinarie_id.value,
            pet_id: select_pet.value.id,
            date_appointment: form.value.date_appointment,
            reason: reason.value,
            amount: form.value.amount,
            state_pay: STATE_PAY,
            method_payment: form.value.method_payment,
            adelanto: form.value.amount_add,
            selected_segment_times: [], // Slot management removed as per UI removal
        }
        const resp = await $api('/appointments', {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al programar la cita medica' });
            }

        })
        console.log(resp);
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La cita medica se ha programado correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        setTimeout(() => {
            router.push({ name: 'appointment-list' });
        }, 1500);

        fieldsClean()

    } catch (error) {
        console.log(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
    }

}
// CODIGO PARA LA BUSQUEDA DEL PACIENTE(MASCOTA)
const loading = ref(false)
const search = ref()
const select_pet = ref(null)
const items = ref([])

const loadAllPets = async () => {
    loading.value = true
    try {
        const resp = await $api("/pets", {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar las mascotas' });
            }

        })
        items.value = resp.pets.data.map(pet => ({
            id: pet.id,
            name: pet.name,
            specie: pet.specie,
            breed: pet.breed,
            owner: pet.owner
        }));
    } catch (error) {
        console.log(error);
    }
    loading.value = false
}

const querySelections = async (query) => {
    loading.value = true

    // Simulated ajax query
    setTimeout(async () => {
        const resp = await $api("/appointments/search-pets/" + query, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al buscar mascotas' });
            }

        })
        console.log(resp);
        items.value = resp.pets;
        loading.value = false
    }, 500)
}
watch(search, query => {
    if (query && query.length > 1) {
        querySelections(query)
    } else if (!query) {
        loadAllPets();
    }
})

onMounted(() => {
    loadAllPets()
    listVeterinaries()
})
// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
    meta: {
        permisssion: 'register_appointment'
    },
})
</script>
<template>
    <div>
        <VCardText class="pa-5">
            <div class="mb-1">
                <h4 class="text-h4 text-center mb-1">
                    Crear Cita Medica 👩‍💻
                </h4>
            </div>
        </VCardText>

        <VCard title="🔎 Busqueda:" class="pa-4">
            <VRow>
                <VCol cols="4">
                    <AppDateTimePicker v-model="form.date_appointment" label="Fecha de la cita" :config="{
                        minDate: 'today', disable: [
                            (date) => {
                                // Deshabilita sábados (6) y domingos (0)
                                return date.getDay() === 0 || date.getDay() === 6;
                            },
                        ]
                    }" />
                </VCol>
                <VCol cols="3">
                    <AppDateTimePicker v-model="form.time" label="Hora de la cita"
                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }" />
                </VCol>
                <VCol cols="3">
                    <VBtn color="secondary" class="mx-1" prepend-icon="ri-restart-line" @click="reset()">
                    </VBtn>
                </VCol>
            </VRow>
        </VCard>

        <VCard title="🧑‍⚕️ Veterinario y Motivo:" class="pa-4 mt-4">
            <VRow>
                <VCol cols="6">
                    <VSelect v-model="veterinarie_id" :items="veterinaries" label="Veterinario" item-title="full_name"
                        item-value="id" placeholder="Selecciona un veterinario" eager />
                </VCol>
                <VCol cols="6">
                    <VTextarea v-model="reason" label="Razon de la cita:" placeholder="Escribe el motivo..." />
                </VCol>
            </VRow>
        </VCard>

        <VCard title="🐶 Paciente:" class="pa-4 mt-4">
            <VRow>
                <VCol cols="4">
                    <VAutocomplete v-model="select_pet" v-model:search="search" :loading="loading" :items="items"
                        item-title="name" item-value="id" return-object placeholder="Ingresa información de la mascota"
                        label="¿Quien es la mascotita?" variant="underlined" :menu-props="{ maxHeight: '200px' }" />
                </VCol>
                <VCol cols="2" v-if="select_pet">
                    <label for="">Especie: {{ select_pet.specie }}</label>
                    <br>
                    <label for="">Raza: {{ select_pet.breed }}</label>
                </VCol>
                <VCol cols="3" v-if="select_pet">
                    <label for="">Nombre y Apellido: {{ select_pet.owner.first_name + ' ' + select_pet.owner.last_name
                    }}</label>
                    <br>
                    <label for="">Telefono: {{ select_pet.owner.phone }}</label>
                    <br>
                    <label for="">Documento: {{ select_pet.owner.n_document }}</label>
                </VCol>
            </VRow>
        </VCard>
        <VCard title="💵 Pagos:" class="pa-4 mt-4">
            <VRow>
                <VCol cols="4">
                    <VTextField label="Costo de la cita:" type="number" placeholder="Example: 100"
                        v-model="form.amount" />
                </VCol>
            </VRow>
            <VRow>
                <VCol cols="4">
                    <VSelect v-model="form.method_payment" :items="method_payments" label="Metodos de pago"
                        item-title="name" item-value="id" placeholder="Select Metodo" eager />
                </VCol>
                <VCol cols="4">
                    <VTextField v-model="form.amount_add" label="Adelanto:" type="number" placeholder="Example: 100" />
                </VCol>
            </VRow>
        </VCard>

        <VCardText class="pa-5 py-0 text-end">
            <VBtn color="primary" class="mb-4" @click="store()">
                Crear
            </VBtn>
        </VCardText>
    </div>
</template>