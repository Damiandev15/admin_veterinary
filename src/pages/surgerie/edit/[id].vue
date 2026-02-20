<script setup>
import Swal from 'sweetalert2';


const route = useRoute('surgerie-edit-id');
const router = useRouter();
const form = ref({
    surgerie_date: null,
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
const surgerie_types = ref([
    "ESTERILIZACIÓN",
    "CASTRACIÓN",
    "TRAUMATOLÓGICAS",
    "OCULARES",
    "ONCOLÓGICAS",
    "OTRO"
]);
const veterinarie_id = ref(null);
const veterinaries = ref([]);
const medical_notes = ref(null);
const outcome = ref(null);
const surgerie_type = ref(null);
const outside = ref('0');
const surgerie_selected = ref(null);
const state = ref(1);

const reset = () => {
    form.value.surgerie_date = null;
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
        if (!medical_notes.value) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido digitar una razon para la atención de la mascota" });
            return;
        }

        if (!select_pet.value) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido seleccionar una mascota" });
            return;
        }

        if (!form.value.amount) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: "Es requerido ingresar el costo de la cirujía" });
            return;
        }

        let data = {
            veterinarie_id: veterinarie_id.value,
            pet_id: select_pet.value.id,
            surgerie_date: form.value.surgerie_date,
            medical_notes: medical_notes.value,
            surgerie_type: surgerie_type.value,
            amount: form.value.amount,
            selected_segment_times: [], // Slot management removed as per UI removal
            outcome: outcome.value,
            outside: outside.value,
            state: state.value,
        }
        const resp = await $api('/surgeries/' + route.params.id, {
            method: 'PATCH',
            body: data,
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' });
            }
        })

        console.log(resp);
        if (resp.message == 403) {
            Swal.fire({ icon: 'error', title: 'Error', text: resp.message_text });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'La cirugía se ha editado correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            setTimeout(() => {
                router.push({ name: 'surgerie-list' });
            }, 1500);

            show();
            reset();
        }
    } catch (error) {
        console.log(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
    }

}
const show = async () => {
    try {
        const resp = await $api("/surgeries/" + route.params.id, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información de la cirugía' });
            }
        })

        console.log(resp);
        surgerie_selected.value = resp.surgerie;
        medical_notes.value = surgerie_selected.value.medical_notes;
        form.value.amount = surgerie_selected.value.amount;
        select_pet.value = surgerie_selected.value.pet;
        veterinarie_id.value = surgerie_selected.value.veterinarie_id;
        outcome.value = surgerie_selected.value.outcome;
        outside.value = surgerie_selected.value.outside + "";
        surgerie_type.value = surgerie_selected.value.surgerie_type;
        state.value = surgerie_selected.value.state;
        if (surgerie_selected.value.payments && surgerie_selected.value.payments.length > 0) {
            form.value.method_payment = surgerie_selected.value.payments[0].method_payment;
            form.value.amount_add = surgerie_selected.value.payments[0].amount;
        }
    } catch (error) {
        console.log(error);
    }
}
onMounted(() => {
    show();
    listVeterinaries();
})
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
        permisssion: 'edit_surgeries'
    },
})
</script>
<template>
    <div>
        <VCardText class="pa-5">
            <div class="mb-1">
                <h4 class="text-h4 text-center mb-1">
                    Edit Surgerie 🏥 {{ route.params.id }}
                </h4>
            </div>
        </VCardText>

        <VCard title="🔎 Busqueda:" class="pa-4">
            <VRow>
                <VCol cols="4">
                    <AppDateTimePicker v-model="form.surgerie_date" label="Fecha de la cirugía" :config="{
                        minDate: 'today', disable: [
                            (date) => {
                                // Deshabilita sábados (6) y domingos (0)
                                return date.getDay() === 0 || date.getDay() === 6;
                            },
                        ]
                    }" />
                </VCol>
                <VCol cols="3">
                    <AppDateTimePicker v-model="form.time" label="Hora de la cirugía"
                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }" />
                </VCol>
                <VCol cols="3">
                    <VBtn color="secondary" class="mx-1" prepend-icon="ri-restart-line" @click="reset()">
                    </VBtn>
                </VCol>
            </VRow>
        </VCard>

        <VCard title="🧑‍⚕️ Veterinario y Cirugía:" class="pa-4 mt-4">
            <VRow>
                <VCol cols="4">
                    <VSelect v-model="veterinarie_id" :items="veterinaries" label="Veterinario" item-title="full_name"
                        item-value="id" placeholder="Selecciona un veterinario" eager />
                </VCol>
                <VCol cols="4">
                    <VSelect v-model="surgerie_type" :items="surgerie_types" label="Tipo de cirugías"
                        placeholder="Select Tipo" eager />
                </VCol>
                <VCol cols="4">
                    <VRadioGroup v-model="outside" inline>
                        <VRadio label="Dentro de la veterinaria" value="0" />
                        <VRadio label="Fuera de la veterinaria" value="1" />
                    </VRadioGroup>
                </VCol>
                <VCol cols="6">
                    <VTextarea v-model="medical_notes" label="Nota medica:" placeholder="Motivo de la cirugía..." />
                </VCol>
                <VCol cols="6">
                    <VTextarea v-model="outcome" label="Resultado de la cirugía:" placeholder="Resultado..." />
                </VCol>
            </VRow>
        </VCard>

        <VCard title="⏱️ Hora de atención:" v-if="surgerie_selected" class="pa-4 mt-4">
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
                    ]" v-model="state" label="Estado de la cirujía" item-title="name" item-value="id"
                        :disabled="surgerie_selected.state == 2 || surgerie_selected.state == 3 ? true : false"
                        placeholder="Select Estado" eager />
                </VCol>
                <VCol cols="8"
                    v-if="surgerie_selected.schedule_for_hour && surgerie_selected.schedule_for_hour.length > 0">
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    Veterinario
                                </th>
                                <th class="text-uppercase">
                                    Dia de la cirujía
                                </th>
                                <th class="text-uppercase">
                                    Duración de la cirujía
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    {{ surgerie_selected.veterinarie.full_name }}
                                </td>
                                <td>
                                    {{ surgerie_selected.surgerie_date }}
                                </td>
                                <td>
                                    <ul>
                                        <template v-for="(for_hour, index) in surgerie_selected.schedule_for_hour"
                                            :key="index">
                                            <template v-if="!for_hour.is_complete">
                                                <li v-for="(schedule, index2) in for_hour.segments_time" :key="index2">
                                                    <label for="" style="font-weight: bold;">{{
                                                        schedule.schedule_hour.hour_start_format + ' ' +
                                                        schedule.schedule_hour.hour_end_format }}</label>
                                                </li>
                                            </template>
                                            <li v-if="for_hour.is_complete">
                                                <label for="" style="font-weight: bold;">{{ for_hour.hour_format
                                                    }}</label>
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
                    <VTextField label="Costo de la cirugía:" type="number" placeholder="Example: 100"
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