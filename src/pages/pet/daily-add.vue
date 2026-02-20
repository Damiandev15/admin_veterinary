<script setup>
import Swal from 'sweetalert2';

const router = useRouter();
const form = ref({
    name: null,
    specie: null,
    breed: null,
    dirth_date: null,
    gender: null,
    color: null,
    weight: 0,
    medical_notes: null,
    first_name: null,
    last_name: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    emergency_contact: null,
    type_document: "Cédula de Identidad",
    n_document: null,
    social_media: null,
});

const type_documents = ['Cédula de Identidad', 'PASAPORTE', 'CARNET DE EXTRANJERIA'];
const species = ref(['Canino', 'Felino']);
const FILE_AVATAR = ref(null);
const IMAGEN_PREVIZUALIZA = ref(null);

const loadFile = ($event) => {
    const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event);
    if (!file) return;

    if (file.type.indexOf("image") < 0) {
        FILE_AVATAR.value = null;
        IMAGEN_PREVIZUALIZA.value = null;
        Swal.fire({ icon: 'error', title: 'Error', text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN' });
        return;
    }

    FILE_AVATAR.value = file;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        IMAGEN_PREVIZUALIZA.value = reader.result;
    };
}

const removePetPhoto = () => {
    FILE_AVATAR.value = null;
    IMAGEN_PREVIZUALIZA.value = null;
}

const fieldsClean = () => {
    Object.keys(form.value).forEach(key => {
        if (key === 'weight') form.value[key] = 0;
        else if (key === 'type_document') form.value[key] = "Cédula de Identidad";
        else form.value[key] = null;
    });
    FILE_AVATAR.value = null;
    IMAGEN_PREVIZUALIZA.value = null;
}

const store = async () => {
    try {
        if (!form.value.name || !form.value.specie || !form.value.breed || !form.value.dirth_date || !form.value.gender || !form.value.color || !form.value.weight || !form.value.medical_notes || !FILE_AVATAR.value || !form.value.first_name || !form.value.last_name || !form.value.email || !form.value.phone || !form.value.address || !form.value.city || !form.value.type_document || !form.value.n_document || !form.value.emergency_contact) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor complete todos los campos obligatorios.' });
            return;
        }

        let formData = new FormData();
        Object.keys(form.value).forEach(key => {
            if (form.value[key] !== null) {
                formData.append(key, form.value[key]);
            }
        });
        formData.append("imagen", FILE_AVATAR.value);

        await $api('/pets', {
            method: 'POST',
            body: formData,
            onResponseError() {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al guardar en el servidor.' });
            }
        })

        Swal.fire({ icon: 'success', title: 'Éxito', text: 'La mascota se ha registrado correctamente.', showConfirmButton: false, timer: 1500 });
        setTimeout(() => { router.push({ name: 'pet-daily-list' }); }, 1500);
        fieldsClean();

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado.' });
    }
}

definePage({
    name: 'pet-daily-add',
    meta: { permisssion: 'register_pet' },
})
</script>

<template>
    <div>
        <VCardText class="pa-5">
            <h4 class="text-h4 text-center mb-1">Registrar Mascota (Diario) 🐾</h4>
        </VCardText>

        <VCard title="🐕‍🦺 Mascota:" class="pa-4">
            <VRow>
                <VCol cols="12" md="6">
                    <VTextField label="Nombre" v-model="form.name" placeholder="Example: Boby" />
                </VCol>
                <VCol cols="12" md="3">
                    <VSelect :items="species" v-model="form.specie" label="Especie" placeholder="Select Specie" eager />
                </VCol>
                <VCol cols="12" md="3">
                    <VTextField label="Raza" v-model="form.breed" placeholder="Example: Pastor Aleman" />
                </VCol>
                <VCol cols="12" md="3">
                    <label>Fecha de nacimiento</label>
                    <div class="app-picker-field">
                        <input type="date" class="v-field__input w-100 border p-2 rounded mt-1"
                            v-model="form.dirth_date">
                    </div>
                </VCol>
                <VCol cols="12" md="3">
                    <VRadioGroup v-model="form.gender" inline label="Género">
                        <VRadio label="Macho" value="M" />
                        <VRadio label="Hembra" value="H" />
                    </VRadioGroup>
                </VCol>
                <VCol cols="12" md="3">
                    <VTextField label="Peso (KG)" type="number" v-model="form.weight" placeholder="Example: 20 KG" />
                </VCol>
                <VCol cols="12" md="3">
                    <VTextarea v-model="form.color" label="Color" placeholder="Text" rows="1" />
                </VCol>
                <VCol cols="12" md="8">
                    <VFileInput label="Foto de la Mascota" @change="loadFile($event)" accept=".jpg,.jpeg,.png" />
                    <VTextarea v-model="form.medical_notes" label="Nota Medica" placeholder="Text" rows="3"
                        class="mt-4" />
                </VCol>
                <VCol cols="12" md="4">
                    <div class="border rounded d-flex align-center justify-center position-relative p-1"
                        style="height: 220px; background: #2f3349; overflow: hidden;">
                        <img v-if="IMAGEN_PREVIZUALIZA" :src="IMAGEN_PREVIZUALIZA"
                            style="width: 100%; height: 220px; object-fit: cover;" class="rounded" />
                        <span v-else class="text-disabled">Sin foto</span>
                        <VBtn v-if="IMAGEN_PREVIZUALIZA" icon="ri-close-line" size="x-small" color="error"
                            class="position-absolute" style="top: 5px; right: 5px;" @click="removePetPhoto" />
                    </div>
                </VCol>
            </VRow>
        </VCard>

        <VCard title="🧔Propietario:" class="mt-4 pa-4">
            <VRow>
                <VCol cols="12" md="6">
                    <VTextField label="Nombre:" v-model="form.first_name" placeholder="Example: Rafael" />
                </VCol>
                <VCol cols="12" md="6">
                    <VTextField label="Apellido:" v-model="form.last_name" placeholder="Example: Mendoza" />
                </VCol>
                <VCol cols="12" md="4">
                    <VTextField v-model="form.email" label="Email" type="email" placeholder="johndoe@email.com" />
                </VCol>
                <VCol cols="12" md="4">
                    <VTextField label="Telefono:" type="number" v-model="form.phone" placeholder="Example: 99999999" />
                </VCol>
                <VCol cols="12" md="4">
                    <VTextField label="N° de documento:" type="number" v-model="form.n_document"
                        placeholder="Example: 12345678" />
                </VCol>
                <VCol cols="12" md="5">
                    <VTextField label="Dirección:" v-model="form.address" placeholder="Example: Calle o Mzt" />
                </VCol>
                <VCol cols="12" md="3">
                    <VTextField label="Ciudad:" v-model="form.city" placeholder="Example: Lima" />
                </VCol>
                <VCol cols="12" md="4">
                    <VSelect :items="type_documents" v-model="form.type_document" label="Tipo de documento"
                        placeholder="Select Item" eager />
                </VCol>
                <VCol cols="12" md="6">
                    <VTextarea v-model="form.emergency_contact" label="Contacto de emergencia" placeholder="Text"
                        rows="2" />
                </VCol>
                <VCol cols="12" md="6">
                    <VTextField label="Red Social:" v-model="form.social_media" placeholder="Example: @usuario" />
                </VCol>
            </VRow>
        </VCard>

        <div class="text-right mt-4">
            <VBtn color="primary" size="large" @click="store">Registrar Mascota</VBtn>
        </div>
    </div>
</template>
