<script setup>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({
    pet_id: null,
    grooming_cut_type: null,
    grooming_face_style: null,
    grooming_observations: null,
    grooming_services: [],
});

const grooming_cut_types = ['Bajo', 'Medio', 'Alto'];
const grooming_face_styles = ['Redonda', 'Cuadrada'];
const grooming_services_list = [
    { title: 'Oídos', value: 'Oídos' },
    { title: 'Uñas', value: 'Uñas' },
    { title: 'Higiénico', value: 'Higiénico' },
];

const FILE_GROOMING = ref([]);
const IMAGEN_GROOMING_PREVIZUALIZA = ref([]);
const pets_list = ref([]);
const searchPet = ref('');

const loadFileGrooming = ($event) => {
    const files = Array.from($event.target.files);
    if (files.some(file => file.type.indexOf("image") < 0)) {
        FILE_GROOMING.value = [];
        IMAGEN_GROOMING_PREVIZUALIZA.value = [];
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
        });
        return;
    }

    const totalPhotos = IMAGEN_GROOMING_PREVIZUALIZA.value.length + files.length;
    if (totalPhotos > 5) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'SOLAMENTE SE PERMITEN HASTA 5 FOTOS EN TOTAL',
        });
        return;
    }

    FILE_GROOMING.value = [...FILE_GROOMING.value, ...files];

    files.forEach(file => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => IMAGEN_GROOMING_PREVIZUALIZA.value.push(reader.result);
    });
}

const removeGroomingPhoto = (index) => {
    IMAGEN_GROOMING_PREVIZUALIZA.value.splice(index, 1);
    if (FILE_GROOMING.value.length > index) {
        const newFiles = Array.from(FILE_GROOMING.value);
        newFiles.splice(index, 1);
        FILE_GROOMING.value = newFiles;
    }
}

const filterPets = async (val) => {
    if (!val) return;
    try {
        const resp = await $api('/appointments/search-pets/' + val, {
            method: 'GET',
        });
        // The API returns { pets: [...] }
        pets_list.value = resp.pets.map(pet => ({
            title: `${pet.name} - ${pet.owner ? pet.owner.first_name + ' ' + (pet.owner.last_name || '') : ''}`,
            value: pet.id,
            ...pet
        }));
    } catch (error) {
        console.error(error);
    }
}

watch(searchPet, (val) => {
    if (val && val.length > 2) {
        filterPets(val);
    }
});

const fieldsClean = () => {
    form.value.pet_id = null;
    form.value.grooming_cut_type = null;
    form.value.grooming_face_style = null;
    form.value.grooming_observations = null;
    form.value.grooming_services = [];
    FILE_GROOMING.value = [];
    IMAGEN_GROOMING_PREVIZUALIZA.value = [];
    pets_list.value = [];
    searchPet.value = '';
}

const store = async () => {
    try {
        if (!form.value.pet_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Debe seleccionar una mascota',
            });
            return;
        }

        let formData = new FormData();
        formData.append("pet_id", form.value.pet_id);

        if (form.value.grooming_cut_type) formData.append("grooming_cut_type", form.value.grooming_cut_type);
        if (form.value.grooming_face_style) formData.append("grooming_face_style", form.value.grooming_face_style);
        if (form.value.grooming_observations) formData.append("grooming_observations", form.value.grooming_observations);

        formData.append("grooming_services", JSON.stringify(form.value.grooming_services));

        if (FILE_GROOMING.value.length > 0) {
            FILE_GROOMING.value.forEach(file => {
                formData.append("grooming_photos_file[]", file);
            });
        }

        const resp = await $api('/groomings', { // Using the new store endpoint
            method: 'POST',
            body: formData,
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'En el servidor hubo un error al guardar',
                });
            }
        })

        console.log(resp);
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La información de peluquería se ha guardado correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        setTimeout(() => {
            router.push({ name: 'grooming-list' });
        }, 1500);

        fieldsClean();

    } catch (error) {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error inesperado',
        });
    }
}

definePage({
    meta: {
        permisssion: 'register_pet'
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

        <VCard title="🐕 Seleccionar Mascota:" class="pa-4 mb-4">
            <VRow>
                <VCol cols="12">
                    <VAutocomplete v-model="form.pet_id" v-model:search="searchPet" :items="pets_list"
                        label="Buscar Mascota (Nombre, Propietario, Documento)" placeholder="Escriba para buscar..."
                        item-title="title" item-value="value" return-object="false" />
                </VCol>
            </VRow>
        </VCard>

        <!-- Peluquería y Estética -->
        <VCard title="✂️ Peluquería y Estética:" class="my-2 pa-4">
            <VRow>
                <VCol cols="6">
                    <VSelect :items="grooming_cut_types" v-model="form.grooming_cut_type" label="Tipo de Corte"
                        placeholder="Seleccionar" />
                </VCol>
                <VCol cols="6">
                    <VSelect :items="grooming_face_styles" v-model="form.grooming_face_style" label="Estilo de Cara"
                        placeholder="Seleccionar" />
                </VCol>
                <VCol cols="12">
                    <VTextarea v-model="form.grooming_observations" label="Observaciones de Peluquería"
                        placeholder="..." />
                </VCol>
                <VCol cols="12">
                    <label class="d-block mb-2">Servicios Adicionales:</label>
                    <div class="d-flex gap-4">
                        <VCheckbox v-for="service in grooming_services_list" :key="service.value" :label="service.title"
                            :value="service.value" v-model="form.grooming_services" inline />
                    </div>
                </VCol>
                <VCol cols="4">
                    <VFileInput label="Fotos Grooming (Hasta 5)" multiple @change="loadFileGrooming($event)"
                        accept=".jpg,.jpeg,.png" />
                </VCol>
                <VCol cols="12" class="d-flex flex-wrap gap-2">
                    <div v-for="(img, index) in IMAGEN_GROOMING_PREVIZUALIZA" :key="index" class="position-relative">
                        <img :src="img" style="width: 150px; height: 150px; object-fit: cover;"
                            class="rounded border" />
                        <span class="position-absolute cursor-pointer text-white"
                            style="top: 5px; right: 8px; font-size: 24px; font-weight: bold; text-shadow: 0 0 3px rgba(0,0,0,0.8); z-index: 10; line-height: 1;"
                            @click="removeGroomingPhoto(index)">×</span>
                    </div>
                </VCol>
            </VRow>
        </VCard>

        <VCardText class="pa-5 py-0 text-end">
            <VBtn color="primary" class="mb-4" @click="store()">
                Guardar
            </VBtn>
        </VCardText>
    </div>
</template>