<script setup>
import Swal from 'sweetalert2';


const route = useRoute('appointment-edit-id');
const router = useRouter();
const form = ref({
    date_appointment: null,
    time: null,
    amount: 0,
    method_payment: 'DIVISAS',
    amount_add: 0,
    state: 1,
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
const appointment_selected = ref(null);

const reset = () => {
    form.value.date_appointment = null;
    form.value.time = null;
}

const fieldsClean = () => {
    form.value.date_appointment = null;
    form.value.time = null;
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

const update = async () => {
    try {
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

        let data = {
            veterinarie_id: veterinarie_id.value,
            pet_id: select_pet.value.id,
            reason: reason.value,
            amount: form.value.amount,
            selected_segment_times: [], // Slot management removed as per UI removal
            state: form.value.state,
        }
        if (form.value.date_appointment) {
            data.date_appointment = form.value.date_appointment;
        }
        const resp = await $api('/appointments/' + route.params.id, {
            method: 'PATCH',
            body: data,
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al editar la cita medica' });
            }

        })
        console.log(resp);
        if (resp.message == 403) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: resp.message_text });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'La cita medica se ha editado correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            setTimeout(() => {
                router.push({ name: 'appointment-list' });
            }, 1500);

            show();
            fieldsClean();
        }
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
    } else {
        items.value = [];
    }
})
// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
    meta: {
        permisssion: 'edit_appointment'
    },
})


const show = async () => {
    try {
        const resp = await $api("/appointments/" + route.params.id, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar los datos de la cita' });
            }

        })
        console.log(resp);
        appointment_selected.value = resp.appointment;
        reason.value = appointment_selected.value.reason;
        form.value.amount = appointment_selected.value.amount;
        form.value.state = appointment_selected.value.state;
        select_pet.value = appointment_selected.value.pet;
        veterinarie_id.value = appointment_selected.value.veterinarie_id;
        if (appointment_selected.value.payments && appointment_selected.value.payments.length > 0) {
            form.value.method_payment = appointment_selected.value.payments[0].method_payment;
            form.value.amount_add = appointment_selected.value.payments[0].amount;
        }
    } catch (error) {
        console.log(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al cargar la cita' });
    }

}
onMounted(() => {
    show();
    listVeterinaries();
})
</script>
<template>
    <div>
        <VCardText class="pa-5">
            <div class="mb-1">
                <h4 class="text-h4 text-center mb-1">
                    Edit Appointment 👩‍💻 : #{{ route.params.id }}
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

        <VCard title="⏱️ Horario de la Cita:" v-if="appointment_selected" class="pa-4 mt-4">
            <VRow>
                <VCol cols="3">
                    <VSelect :items="[
                        {
                            name: 'Pendiente',
                            id: 1,
                        },
                        {
                            name: 'Cancelado',
                            id: 2,
                        },
                        {
                            name: 'Atendido',
                            id: 3,
                        }
                    ]" v-model="form.state" label="Estado de la cita" item-title="name" item-value="id"
                        :disabled="appointment_selected.state == 2 || appointment_selected.state == 3 ? true : false"
                        placeholder="Select Estado" eager />
                </VCol>
                <VCol cols="8" v-if="appointment_selected.schedules && appointment_selected.schedules.length > 0">
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    Veterinario
                                </th>
                                <th class="text-uppercase">
                                    Dia de la cita
                                </th>
                                <th class="text-uppercase">
                                    Horario de atención
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    {{ appointment_selected.veterinarie.full_name }}
                                </td>
                                <td>
                                    {{ appointment_selected.date_appointment }}
                                </td>
                                <td>
                                    <ul>
                                        <template v-for="(schedule, index) in appointment_selected.schedules"
                                            :key="index">
                                            <li>
                                                <label for="" style="font-weight: bold;">{{
                                                    schedule.schedule_hour.hour_start_format + ' ' +
                                                    schedule.schedule_hour.hour_end_format }}</label>
                                            </li>
                                        </template>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </VTable>
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
                <VCol cols="4">
                    <VSelect :items="method_payments" v-model="form.method_payment" label="Metodo de pago"
                        placeholder="Select Metodo" eager />
                </VCol>
                <VCol cols="4">
                    <VTextField label="Adelanto:" type="number" placeholder="Example: 100" v-model="form.amount_add" />
                </VCol>
            </VRow>
        </VCard>

        <VCardText class="pa-5 py-0 text-end">
            <VBtn color="primary" class="mb-4" @click="update()">
                Editar
            </VBtn>
        </VCardText>
    </div>
</template>