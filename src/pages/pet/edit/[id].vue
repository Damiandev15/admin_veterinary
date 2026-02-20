<script setup>
import Swal from 'sweetalert2';
const route = useRoute('pet-edit-id');
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

    // Historia Clínica
    evolution_notes: null,
    exams_hematology: null,
    exams_chemistry: null,

    // Tratamiento y Prevención
    general_treatment: null,
    vaccine_rabies: [''],
    vaccine_sextuple: [''],
    vaccine_puppy: [''],
    deworming: [''],
    bravecto_product: [''],

    // Peluquería y Estética
    grooming_cut_type: null,
    grooming_face_style: null,
    grooming_observations: null,
    grooming_services: [],

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
const grooming_cut_types = ['Bajo', 'Medio', 'Alto'];
const grooming_face_styles = ['Redonda', 'Cuadrada'];
const grooming_services_list = [
    { title: 'Oídos', value: 'Oídos' },
    { title: 'Uñas', value: 'Uñas' },
    { title: 'Higiénico', value: 'Higiénico' },
];

const FILE_GROOMING = ref([]);
const IMAGEN_GROOMING_PREVIZUALIZA = ref([]);

const loadFileGrooming = ($event) => {
    const files = Array.from($event.target.files || (Array.isArray($event) ? $event : []));
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

    // warning.value = '';

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


const type_documents = [
    'Cédula de Identidad',
    'PASAPORTE',
    'CARNET DE EXTRANJERIA'
];
const species = ref(['Canino', 'Felino']);
const FILE_AVATAR = ref(null);
const IMAGEN_PREVIZUALIZA = ref(null);
const pet_selected = ref({
    name: ''
});

const hematology_options = [
    'Hemoglobina',
    'Hematocrito',
    'Cta. Blanca',
    'Segmentados',
    'Linfocitos',
    'Eosinofilos',
    'Monocitos',
    'Cayados'
];

const hematology_units = {
    'Hemoglobina': 'g/dl',
    'Hematocrito': '%',
    'Cta. Blanca': 'xmm3',
    'Segmentados': '%',
    'Linfocitos': '%',
    'Eosinofilos': '%',
    'Monocitos': '%',
    'Cayados': '%'
};

const chemistry_options = [
    'Urea',
    'Creatinina',
    'ALT / TGP',
    'AST / TGO',
    'Fosfatasa Alcalina',
    'Proteinas Totales',
    'Albumina',
    'Globulinas',
    'Relacion A/G',
    'Glucosa',
    'Colesterol',
    'Trigliceridos',
    'Bilirrubina Total',
    'Bilirrubina Directa',
    'Amilasa'
];

const chemistry_refs = {
    'Urea': '10 - 50 mg/dl',
    'Creatinina': '0.5 - 1.5 mg/dl',
    'ALT / TGP': '10 - 100 U/L',
    'AST / TGO': '10 - 50 U/L',
    'Fosfatasa Alcalina': '20 - 150 U/L',
    'Proteinas Totales': '5.5 - 7.5 g/dl',
    'Albumina': '2.5 - 4.0 g/dl',
    'Globulinas': '2.5 - 4.0 g/dl',
    'Relacion A/G': '0.8 - 2.0',
    'Glucosa': '60 - 120 mg/dl',
    'Colesterol': '110 - 320 mg/dl',
    'Trigliceridos': '10 - 100 mg/dl',
    'Bilirrubina Total': '0.1 - 0.5 mg/dl',
    'Bilirrubina Directa': '0.0 - 0.2 mg/dl',
    'Amilasa': '500 - 1500 U/L'
};

// Historia Clinica - Estructura de Entradas Completas
const createNewMedicalHistoryEntry = () => {
    return {
        date: new Date().toISOString().split('T')[0],
        evolution_notes: '',
        exams_hematology: [{ name: null, value: '', unit: '' }],
        exams_chemistry: [{ name: null, value: '', v_ref: '' }]
    };
};

const medical_history_entries = ref([createNewMedicalHistoryEntry()]);

const addMedicalHistoryEntry = () => {
    medical_history_entries.value.push(createNewMedicalHistoryEntry());
};

const removeMedicalHistoryEntry = (index) => {
    if (medical_history_entries.value.length > 1) {
        medical_history_entries.value.splice(index, 1);
    }
};

// Manejo de filas de exámenes dentro de una entrada específica
const addHematologyRow = (entryIndex) => {
    medical_history_entries.value[entryIndex].exams_hematology.push({ name: null, value: '', unit: '' });
};

const removeHematologyRow = (entryIndex, examIndex) => {
    if (medical_history_entries.value[entryIndex].exams_hematology.length > 1) {
        medical_history_entries.value[entryIndex].exams_hematology.splice(examIndex, 1);
    }
};

const getHematologyOptions = (entry, currentIndex) => {
    const selected = entry.exams_hematology.map((item, i) => i === currentIndex ? null : item.name).filter(n => n);
    return hematology_options.filter(opt => !selected.includes(opt));
};

const onHematologySelect = (exam) => {
    if (exam.name && hematology_units[exam.name]) {
        exam.unit = hematology_units[exam.name];
    }
};

const addChemistryRow = (entryIndex) => {
    medical_history_entries.value[entryIndex].exams_chemistry.push({ name: null, value: '', v_ref: '' });
};

const removeChemistryRow = (entryIndex, examIndex) => {
    if (medical_history_entries.value[entryIndex].exams_chemistry.length > 1) {
        medical_history_entries.value[entryIndex].exams_chemistry.splice(examIndex, 1);
    }
};

const getChemistryOptions = (entry, currentIndex) => {
    const selected = entry.exams_chemistry.map((item, i) => i === currentIndex ? null : item.name).filter(n => n);
    return chemistry_options.filter(opt => !selected.includes(opt));
};

const onChemistrySelect = (exam) => {
    if (exam.name && chemistry_refs[exam.name]) {
        exam.v_ref = chemistry_refs[exam.name];
    }
};

// Funciones para manejar múltiples fechas de vacunas
const addVaccineDate = (vaccineType) => {
    form.value[vaccineType].push('');
};

const removeVaccineDate = (vaccineType, index) => {
    if (form.value[vaccineType].length > 1) {
        form.value[vaccineType].splice(index, 1);
    }
};

const loadFile = ($event) => {
    const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event);

    if (!file) return;

    if (file.type.indexOf("image") < 0) {
        FILE_AVATAR.value = null;
        IMAGEN_PREVIZUALIZA.value = null;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
        });
        return;
    }


    // warning.value = '';

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


const edit = async () => {
    try {
        if (!form.value.name) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El nombre de la mascota es obligatorio' });
            return;
        }

        if (!form.value.specie) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'La especie de la mascota es obligatorio' });
            return;
        }

        if (!form.value.breed) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'La raza de la mascota es obligatorio' });
            return;
        }

        if (!form.value.dirth_date) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'La fecha de nacimiento de la mascota es obligatorio' });
            return;
        }

        if (!form.value.gender) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El genero de la mascota es obligatorio' });
            return;
        }

        if (!form.value.color) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El color de la mascota es obligatorio' });
            return;
        }

        if (!form.value.weight) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El peso de la mascota es obligatorio' });
            return;
        }


        if (!form.value.first_name) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El nombre delPropietario es obligatorio' });
            return;
        }

        if (!form.value.last_name) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El apellido delPropietario es obligatorio' });
            return;
        }

        if (!form.value.phone) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El telefono delPropietario es obligatorio' });
            return;
        }

        if (!form.value.address) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'La dirección delPropietario es obligatorio' });
            return;
        }

        if (!form.value.emergency_contact) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El contacto de emergencia es obligatorio' });
            return;
        }

        if (!form.value.n_document) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El numero de documento es obligatorio' });
            return;
        }


        let formData = new FormData();
        formData.append("name", form.value.name);
        formData.append("specie", form.value.specie);
        formData.append("breed", form.value.breed);
        formData.append("dirth_date", form.value.dirth_date);
        formData.append("gender", form.value.gender);
        formData.append("color", form.value.color);
        formData.append("weight", form.value.weight);
        if (form.value.medical_notes) {
            formData.append("medical_notes", form.value.medical_notes);
        }
        formData.append("first_name", form.value.first_name);
        formData.append("last_name", form.value.last_name);
        if (form.value.email) {
            formData.append("email", form.value.email);
        }
        formData.append("phone", form.value.phone);
        formData.append("address", form.value.address);
        if (form.value.city) {
            formData.append("city", form.value.city);
        }
        formData.append("emergency_contact", form.value.emergency_contact);
        formData.append("type_document", form.value.type_document);
        formData.append("n_document", form.value.n_document);
        if (form.value.social_media) {
            formData.append("social_media", form.value.social_media);
        }
        if (FILE_AVATAR.value) {
            formData.append("imagen", FILE_AVATAR.value);
        }

        // Historia Clínica - Enviar como JSON las entradas completas
        formData.append("medical_history_entries", JSON.stringify(medical_history_entries.value));

        // Tratamiento y Prevención
        if (form.value.general_treatment) formData.append("general_treatment", form.value.general_treatment);

        // Filtrar fechas vacías y enviar como JSON
        const filteredVaccineRabies = form.value.vaccine_rabies.filter(d => d);
        const filteredVaccineSextuple = form.value.vaccine_sextuple.filter(d => d);
        const filteredVaccinePuppy = form.value.vaccine_puppy.filter(d => d);
        const filteredDeworming = form.value.deworming.filter(d => d);
        const filteredBravectoProduct = form.value.bravecto_product.filter(d => d);

        if (filteredVaccineRabies.length > 0) formData.append("vaccine_rabies", JSON.stringify(filteredVaccineRabies));
        if (filteredVaccineSextuple.length > 0) formData.append("vaccine_sextuple", JSON.stringify(filteredVaccineSextuple));
        if (filteredVaccinePuppy.length > 0) formData.append("vaccine_puppy", JSON.stringify(filteredVaccinePuppy));
        if (filteredDeworming.length > 0) formData.append("deworming", JSON.stringify(filteredDeworming));
        if (filteredBravectoProduct.length > 0) formData.append("bravecto_product", JSON.stringify(filteredBravectoProduct));

        // Peluquería y Estética
        if (form.value.grooming_cut_type) formData.append("grooming_cut_type", form.value.grooming_cut_type);
        if (form.value.grooming_face_style) formData.append("grooming_face_style", form.value.grooming_face_style);
        if (form.value.grooming_observations) formData.append("grooming_observations", form.value.grooming_observations);
        formData.append("grooming_services", JSON.stringify(form.value.grooming_services));
        if (FILE_GROOMING.value.length > 0) {
            FILE_GROOMING.value.forEach(file => {
                formData.append("grooming_photos_file[]", file);
            });
        }


        const resp = await $api('/pets/' + route.params.id, {
            method: 'POST',
            body: formData,
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' });
            }
        })

        console.log(resp);
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'La mascota se ha editado correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        setTimeout(() => {
            router.push({ name: 'pet-list' });
        }, 1500);


    } catch (error) {
        console.log(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
    }

}

const show = async () => {
    try {
        const resp = await $api("/pets/" + route.params.id, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información de la mascota' });
            }
        })

        console.log(resp);
        pet_selected.value = resp.pet;
        // Datos de la mascotita
        form.value.name = pet_selected.value.name;
        form.value.specie = pet_selected.value.specie;
        form.value.breed = pet_selected.value.breed;
        form.value.dirth_date = pet_selected.value.dirth_date;
        form.value.gender = pet_selected.value.gender;
        form.value.color = pet_selected.value.color;
        form.value.weight = pet_selected.value.weight;
        form.value.medical_notes = pet_selected.value.medical_notes;
        // Datos delPropietario
        form.value.first_name = pet_selected.value.owner.first_name;
        form.value.last_name = pet_selected.value.owner.last_name;
        form.value.email = pet_selected.value.owner.email;
        form.value.phone = pet_selected.value.owner.phone;
        form.value.address = pet_selected.value.owner.address;
        form.value.city = pet_selected.value.owner.city;
        form.value.emergency_contact = pet_selected.value.owner.emergency_contact;
        form.value.type_document = pet_selected.value.owner.type_document;
        form.value.n_document = pet_selected.value.owner.n_document;
        form.value.social_media = pet_selected.value.owner.social_media;

        // Cargar secciones nuevas de Historia Clínica
        if (pet_selected.value.medical_history_entries) {
            try {
                const raw = pet_selected.value.medical_history_entries;
                if (typeof raw === 'string' && raw.trim().startsWith('[')) {
                    medical_history_entries.value = JSON.parse(raw);
                } else if (Array.isArray(raw)) {
                    medical_history_entries.value = raw;
                }
            } catch (e) {
                console.error("Error parsing medical_history_entries", e);
            }
        } else if (pet_selected.value.medical_history) {
            // Compatibilidad con registros viejos (si los hay)
            const legacy = pet_selected.value.medical_history;
            const entry = createNewMedicalHistoryEntry();
            entry.evolution_notes = legacy.evolution_notes || '';
            try {
                if (legacy.exams_hematology) entry.exams_hematology = JSON.parse(legacy.exams_hematology);
            } catch (e) { }
            try {
                if (legacy.exams_chemistry) entry.exams_chemistry = JSON.parse(legacy.exams_chemistry);
            } catch (e) { }
            medical_history_entries.value = [entry];
        }

        if (pet_selected.value.treatment) {
            form.value.general_treatment = pet_selected.value.treatment.general_treatment;

            // Parsear fechas de vacunas como arrays
            const parseVaccineDates = (data) => {
                if (!data) return [''];
                try {
                    if (typeof data === 'string' && data.trim().startsWith('[')) {
                        const parsed = JSON.parse(data);
                        return parsed.length > 0 ? parsed : [''];
                    }
                    return data ? [data] : [''];
                } catch (e) {
                    return data ? [data] : [''];
                }
            };

            form.value.vaccine_rabies = parseVaccineDates(pet_selected.value.treatment.vaccine_rabies);
            form.value.vaccine_sextuple = parseVaccineDates(pet_selected.value.treatment.vaccine_sextuple);
            form.value.vaccine_puppy = parseVaccineDates(pet_selected.value.treatment.vaccine_puppy);
            form.value.deworming = parseVaccineDates(pet_selected.value.treatment.deworming);
            form.value.bravecto_product = parseVaccineDates(pet_selected.value.treatment.bravecto_product);
        }

        if (pet_selected.value.grooming) {
            form.value.grooming_cut_type = pet_selected.value.grooming.grooming_cut_type;
            form.value.grooming_face_style = pet_selected.value.grooming.grooming_face_style;
            form.value.grooming_observations = pet_selected.value.grooming.grooming_observations;
            form.value.grooming_services = pet_selected.value.grooming.grooming_services || [];
            IMAGEN_GROOMING_PREVIZUALIZA.value = pet_selected.value.grooming.grooming_photos || [];
        }

        IMAGEN_PREVIZUALIZA.value = pet_selected.value.photo;
    } catch (error) {
        console.log(error);
    }
}
onMounted(() => {
    show();
})
definePage({
    meta: {
        permisssion: 'edit_pet'
    },
})
</script>
<template>
    <div>
        <!-- <VCard class="refer-and-earn-dialog pa-3 pa-sm-11"> -->
        <VCardText class="pa-5">
            <div class="mb-1">
                <h4 class="text-h4 text-center mb-1">
                    🐶 Editar Mascota : "{{ pet_selected.name }}"
                </h4>
            </div>
        </VCardText>

        <VCard title="🐕🦺 Mascota:" class="pa-4">
            <VRow>
                <VCol cols="6">
                    <VTextField label="Nombre" v-model="form.name" placeholder="Example: Boby" />
                </VCol>
                <VCol cols="3">
                    <VSelect :items="species" v-model="form.specie" label="Especie" item-title="name" item-value="id"
                        placeholder="Select Rol" eager />
                </VCol>
                <VCol cols="3">
                    <VTextField label="Raza" v-model="form.breed" placeholder="Example: Pastor Aleman" />
                </VCol>
                <VCol cols="3">
                    <!-- <AppDateTimePicker
                            v-model="form.dirth_date"
                            label="Fecha de nacimiento"
                            placeholder="Select date"
                        /> -->
                    <label for="">Fecha de nacimiento</label>
                    <div class="app-picker-field">
                        <div
                            class="v-input v-input--horizontal v-input--center-affix v-input--density-comfortable v-locale--is-ltr position-relative v-text-field">
                            <div class="v-input__control">
                                <div
                                    class="v-field v-field--center-affix v-field--variant-outlined v-theme--light v-locale--is-ltr">
                                    <div class="v-field__field">
                                        <div class="v-field__input">
                                            <input type="date" class="flat-picker-custom-style flatpickr-input"
                                                v-model="form.dirth_date" style="opacity: 1;">
                                        </div>
                                    </div>
                                    <div class="v-field__outline text-primary">
                                        <div class="v-field__outline__start"></div>
                                        <div class="v-field__outline__notch"><label
                                                class="v-label v-field-			label v-field-label--floating"
                                                aria-hidden="true" for="input-8" style="">Nombre</label></div>
                                        <div class="v-field__outline__end"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </VCol>
                <VCol cols="3">
                    <VRadioGroup v-model="form.gender" inline>
                        <VRadio label="Macho" value="M" />
                        <VRadio label="Hembra" value="H" />
                    </VRadioGroup>
                </VCol>
                <VCol cols="4">
                    <VTextarea v-model="form.color" label="Color" placeholder="Text" />
                </VCol>

                <VCol cols="3">
                    <VTextField label="Peso" type="number" v-model="form.weight" placeholder="Example: 20 KG" />
                </VCol>
                <VCol cols="4">
                    <VFileInput label="Foto de la Mascota" @change="loadFile($event)" accept=".jpg,.jpeg,.png" />
                </VCol>
                <VCol cols="3">
                    <div class="border rounded d-flex align-center justify-center p-1 position-relative"
                        style="min-height: 220px; background: #2f3349; overflow: hidden;">
                        <img v-if="IMAGEN_PREVIZUALIZA" :src="IMAGEN_PREVIZUALIZA"
                            style="width: 100%; height: 220px; object-fit: cover;" class="rounded" />
                        <span v-else class="text-disabled">Sin foto</span>
                        <span v-if="IMAGEN_PREVIZUALIZA" class="position-absolute cursor-pointer text-white"
                            style="top: 5px; right: 8px; font-size: 24px; text-shadow: 0 0 3px rgba(0,0,0,0.8); z-index: 10; line-height: 1;"
                            @click="removePetPhoto">×</span>
                    </div>
                </VCol>



                <VCol cols="4">
                    <VTextarea v-model="form.medical_notes" label="Nota Medica" placeholder="Text" />
                </VCol>

            </VRow>
        </VCard>

        <VCard title="🧔Propietario:" class="my-2 pa-4">
            <VRow>
                <!-- 1era fila  -->
                <VCol cols="6">
                    <VTextField label="Nombre:" v-model="form.first_name" placeholder="Example: Rafael" />
                </VCol>
                <VCol cols="6">
                    <VTextField label="Apellido:" v-model="form.last_name" placeholder="Example: Mendoza" />
                </VCol>
                <!--  -->

                <!-- 2da fila  -->
                <VCol cols="4">
                    <VTextField v-model="form.email" label="Email" type="email" placeholder="johndoe@email.com" />
                </VCol>
                <VCol cols="3">
                    <VTextField label="Telefono:" type="number" v-model="form.phone" placeholder="Example: 99999999" />
                </VCol>
                <VCol cols="5"></VCol>
                <!--  -->

                <!-- 3ra Fila -->
                <VCol cols="5">
                    <VTextField label="Dirección:" v-model="form.address" placeholder="Example: Calle o Mzt" />
                </VCol>
                <VCol cols="3">
                    <VTextField label="Ciudad:" v-model="form.city" placeholder="Example:  Lima" />
                </VCol>
                <VCol cols="4"></VCol>
                <!--  -->

                <!-- 4ra Fila -->
                <VCol cols="3">
                    <VSelect :items="type_documents" v-model="form.type_document" label="Tipo de documento"
                        placeholder="Select Item" eager />
                </VCol>
                <VCol cols="3">
                    <VTextField label="N° de documento:" type="number" v-model="form.n_document"
                        placeholder="Example: Mendoza" />
                </VCol>

                <VCol cols="5">
                    <VTextarea v-model="form.emergency_contact" label="Contacto de emergencia" placeholder="Text" />
                </VCol>

                <VCol cols="6">
                    <VTextField label="Red Social:" v-model="form.social_media" placeholder="Example: @usuario" />
                </VCol>

            </VRow>

        </VCard>

        <!-- Historia Clínica -->
        <VCard title="🏥 Historia Clínica:" class="my-2 pa-4">
            <!-- Botón para agregar nueva entrada de historia clínica -->
            <div class="d-flex justify-end mb-4">
                <VBtn color="primary" variant="outlined" @click="addMedicalHistoryEntry" prepend-icon="ri-add-line">
                    Nueva Historia Clínica
                </VBtn>
            </div>

            <!-- Lista de entradas de historia clínica -->
            <div v-for="(entry, entryIndex) in medical_history_entries" :key="'history-' + entryIndex"
                class="border rounded pa-4 mb-4 position-relative" style="background: rgba(255,255,255,0.03);">

                <!-- Botón eliminar entrada -->
                <VBtn v-if="medical_history_entries.length > 1" size="x-small" color="error" variant="text"
                    @click="removeMedicalHistoryEntry(entryIndex)" class="position-absolute"
                    style="top: 8px; right: 8px;">
                    <span style="font-size: 20px;">×</span>
                </VBtn>

                <VRow>
                    <!-- Fecha de la entrada -->
                    <VCol cols="3">
                        <label class="d-block mb-2 text-caption text-high-emphasis">📅 Fecha</label>
                        <input type="date" class="v-field__input w-100 border p-2 rounded" v-model="entry.date">
                    </VCol>
                    <VCol cols="9">
                        <div class="text-caption text-disabled pt-6">
                            Entrada #{{ entryIndex + 1 }}
                        </div>
                    </VCol>

                    <!-- Notas de Evolución -->
                    <VCol cols="12">
                        <VTextarea v-model="entry.evolution_notes" label="Notas de Evolución" placeholder="..."
                            density="compact" />
                    </VCol>

                    <!-- Exámenes Hematología -->
                    <VCol cols="12">
                        <label class="v-label text-body-2 text-high-emphasis mb-2">Exámenes Hematología</label>
                        <div v-for="(exam, examIndex) in entry.exams_hematology"
                            :key="'hema-' + entryIndex + '-' + examIndex" class="d-flex gap-2 align-center mb-2">
                            <VCol cols="4" class="pa-0">
                                <VSelect v-model="exam.name" :items="getHematologyOptions(entry, examIndex)"
                                    label="Parámetro" density="compact" hide-details
                                    @update:model-value="onHematologySelect(exam)" />
                            </VCol>
                            <VCol cols="3" class="pa-0">
                                <VTextField v-model="exam.value" label="Resultado" density="compact" hide-details />
                            </VCol>
                            <VCol cols="3" class="pa-0">
                                <VTextField v-model="exam.unit" label="Unidad" density="compact" hide-details readonly
                                    variant="filled" />
                            </VCol>
                            <VCol cols="2" class="d-flex align-center pa-0 pl-2">
                                <VBtn v-if="entry.exams_hematology.length > 1" size="small" color="error" variant="text"
                                    @click="removeHematologyRow(entryIndex, examIndex)" class="mr-1">
                                    <span style="font-size: 20px;">x</span>
                                </VBtn>
                                <VBtn v-if="examIndex === entry.exams_hematology.length - 1" size="small"
                                    color="primary" variant="text" @click="addHematologyRow(entryIndex)">
                                    <span style="font-size: 24px;">+</span>
                                </VBtn>
                            </VCol>
                        </div>
                    </VCol>

                    <!-- Exámenes Química -->
                    <VCol cols="12">
                        <label class="v-label text-body-2 text-high-emphasis mb-2">Exámenes Química</label>
                        <div v-for="(exam, examIndex) in entry.exams_chemistry"
                            :key="'chem-' + entryIndex + '-' + examIndex" class="d-flex gap-2 align-center mb-2">
                            <VCol cols="4" class="pa-0">
                                <VSelect v-model="exam.name" :items="getChemistryOptions(entry, examIndex)"
                                    label="Parámetro" density="compact" hide-details
                                    @update:model-value="onChemistrySelect(exam)" />
                            </VCol>
                            <VCol cols="3" class="pa-0">
                                <VTextField v-model="exam.value" label="Result." density="compact" hide-details />
                            </VCol>
                            <VCol cols="3" class="pa-0">
                                <VTextField v-model="exam.v_ref" label="V. Ref." density="compact" hide-details readonly
                                    variant="filled" />
                            </VCol>
                            <VCol cols="2" class="d-flex align-center pa-0 pl-2">
                                <VBtn v-if="entry.exams_chemistry.length > 1" size="small" color="error" variant="text"
                                    @click="removeChemistryRow(entryIndex, examIndex)" class="mr-1">
                                    <span style="font-size: 20px;">x</span>
                                </VBtn>
                                <VBtn v-if="examIndex === entry.exams_chemistry.length - 1" size="small" color="primary"
                                    variant="text" @click="addChemistryRow(entryIndex)">
                                    <span style="font-size: 24px;">+</span>
                                </VBtn>
                            </VCol>
                        </div>
                    </VCol>
                </VRow>
            </div>
        </VCard>

        <!-- Tratamiento y Prevención -->
        <VCard title="💊 Tratamiento y Prevención:" class="my-2 pa-4">
            <VRow>
                <VCol cols="12">
                    <VTextarea v-model="form.general_treatment" label="Tratamiento General" placeholder="..." />
                </VCol>

                <!-- Vacuna Rabia -->
                <VCol cols="4">
                    <label class="d-block mb-2">Vacuna Rabia</label>
                    <div v-for="(date, index) in form.vaccine_rabies" :key="'rabies-' + index"
                        class="d-flex align-center gap-2 mb-2">
                        <input type="date" class="v-field__input flex-grow-1 border p-2 rounded"
                            v-model="form.vaccine_rabies[index]">
                        <VBtn v-if="form.vaccine_rabies.length > 1" size="x-small" color="error" variant="text"
                            @click="removeVaccineDate('vaccine_rabies', index)" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 18px;">×</span>
                        </VBtn>
                        <VBtn v-if="index === form.vaccine_rabies.length - 1" size="x-small" color="primary"
                            variant="text" @click="addVaccineDate('vaccine_rabies')" class="px-1"
                            style="min-width: 30px;">
                            <span style="font-size: 20px;">+</span>
                        </VBtn>
                    </div>
                </VCol>

                <!-- Vacuna Séxtuple -->
                <VCol cols="4">
                    <label class="d-block mb-2">Vacuna Séxtuple</label>
                    <div v-for="(date, index) in form.vaccine_sextuple" :key="'sextuple-' + index"
                        class="d-flex align-center gap-2 mb-2">
                        <input type="date" class="v-field__input flex-grow-1 border p-2 rounded"
                            v-model="form.vaccine_sextuple[index]">
                        <VBtn v-if="form.vaccine_sextuple.length > 1" size="x-small" color="error" variant="text"
                            @click="removeVaccineDate('vaccine_sextuple', index)" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 18px;">×</span>
                        </VBtn>
                        <VBtn v-if="index === form.vaccine_sextuple.length - 1" size="x-small" color="primary"
                            variant="text" @click="addVaccineDate('vaccine_sextuple')" class="px-1"
                            style="min-width: 30px;">
                            <span style="font-size: 20px;">+</span>
                        </VBtn>
                    </div>
                </VCol>

                <!-- Vacuna Puppy -->
                <VCol cols="4">
                    <label class="d-block mb-2">Vacuna Puppy</label>
                    <div v-for="(date, index) in form.vaccine_puppy" :key="'puppy-' + index"
                        class="d-flex align-center gap-2 mb-2">
                        <input type="date" class="v-field__input flex-grow-1 border p-2 rounded"
                            v-model="form.vaccine_puppy[index]">
                        <VBtn v-if="form.vaccine_puppy.length > 1" size="x-small" color="error" variant="text"
                            @click="removeVaccineDate('vaccine_puppy', index)" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 18px;">×</span>
                        </VBtn>
                        <VBtn v-if="index === form.vaccine_puppy.length - 1" size="x-small" color="primary"
                            variant="text" @click="addVaccineDate('vaccine_puppy')" class="px-1"
                            style="min-width: 30px;">
                            <span style="font-size: 20px;">+</span>
                        </VBtn>
                    </div>
                </VCol>

                <!-- Desparasitación -->
                <VCol cols="4">
                    <label class="d-block mb-2">Desparasitación</label>
                    <div v-for="(date, index) in form.deworming" :key="'deworming-' + index"
                        class="d-flex align-center gap-2 mb-2">
                        <input type="date" class="v-field__input flex-grow-1 border p-2 rounded"
                            v-model="form.deworming[index]">
                        <VBtn v-if="form.deworming.length > 1" size="x-small" color="error" variant="text"
                            @click="removeVaccineDate('deworming', index)" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 18px;">×</span>
                        </VBtn>
                        <VBtn v-if="index === form.deworming.length - 1" size="x-small" color="primary" variant="text"
                            @click="addVaccineDate('deworming')" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 20px;">+</span>
                        </VBtn>
                    </div>
                </VCol>

                <!-- Producto Bravecto -->
                <VCol cols="4">
                    <label class="d-block mb-2">Producto Bravecto</label>
                    <div v-for="(date, index) in form.bravecto_product" :key="'bravecto-' + index"
                        class="d-flex align-center gap-2 mb-2">
                        <input type="date" class="v-field__input flex-grow-1 border p-2 rounded"
                            v-model="form.bravecto_product[index]">
                        <VBtn v-if="form.bravecto_product.length > 1" size="x-small" color="error" variant="text"
                            @click="removeVaccineDate('bravecto_product', index)" class="px-1" style="min-width: 30px;">
                            <span style="font-size: 18px;">×</span>
                        </VBtn>
                        <VBtn v-if="index === form.bravecto_product.length - 1" size="x-small" color="primary"
                            variant="text" @click="addVaccineDate('bravecto_product')" class="px-1"
                            style="min-width: 30px;">
                            <span style="font-size: 20px;">+</span>
                        </VBtn>
                    </div>
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
            <VBtn color="primary" class="mb-4" @click="edit()">
                Editar
            </VBtn>
        </VCardText>
        <!-- </VCard> -->

    </div>
</template>
<style>
.v-img__img {
    object-fit: cover !important;
}

.border.rounded.d-flex.align-center.justify-center {
    overflow: hidden;
}
</style>