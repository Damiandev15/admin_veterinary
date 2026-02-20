<script setup>
import { isPermission } from '@/utils/constants';
import Swal from 'sweetalert2';

const router = useRouter()
const searchQuery = ref(null);
const specie = ref(null);
const species = ref(['Canino', 'Felino']);
const pets = ref([]);
const currentPage = ref(1);
const totalPage = ref(1);

const list = async () => {
    const resp = await $api('/pets/daily?page=' + currentPage.value + '&search=' + (searchQuery.value ? searchQuery.value : '')
        + '&species=' + (specie.value ? specie.value : '')
        , {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
            }
        })
    totalPage.value = resp.total_page;
    pets.value = resp.pets.data;
}

const editItem = (item) => {
    router.push({
        name: 'pet-daily-edit-id',
        params: { id: item.id }
    })
}

const deleteItem = async (item) => {
    const result = await Swal.fire({
        title: '¿Quitar del Registro Diario?',
        text: `La mascota "${item.name}" dejará de aparecer en la lista de hoy, pero permanecerá guardada en el listado general.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ffb400'
    });

    if (result.isConfirmed) {
        try {
            await $api(`/pets/${item.id}/daily`, { method: 'DELETE' });
            let INDEX = pets.value.findIndex((pet) => pet.id == item.id);
            if (INDEX != -1) {
                pets.value.splice(INDEX, 1);
            }
            Swal.fire({
                icon: 'success',
                title: 'Quitado',
                text: 'La mascota se ha removido de la vista diaria correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un error al intentar remover la mascota.', 'error');
        }
    }
}

const reset = () => {
    searchQuery.value = null;
    specie.value = null;
    currentPage.value = 1;
    list();
}

const avatarText = value => {
    if (!value) return ''
    const nameArray = value.split(' ')
    return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

watch(currentPage, () => {
    list();
})

onMounted(() => {
    list()
})

definePage({
    name: 'pet-daily-list',
    meta: {
        permisssion: 'list_pet'
    },
})
</script>

<template>
    <div>
        <VCard title="🐶 Registro Diario (Desde 9:00 AM)">
            <VCardText class="d-flex flex-wrap gap-4">
                <div class="d-flex align-center">
                    <VTextField v-model="searchQuery" placeholder="Search Pets" style="inline-size: 300px;"
                        density="compact" class="me-3" @keyup.enter="list" />
                </div>
                <div>
                    <VSelect :items="species" v-model="specie" style="inline-size: 300px;" label="Especie"
                        item-title="name" item-value="id" placeholder="Select Rol" eager />
                </div>
                <div>
                    <VBtn color="info" class="mx-1" prepend-icon="ri-search-2-line" @click="list()" />
                    <VBtn color="secondary" class="mx-1" prepend-icon="ri-restart-line" @click="reset()" />
                </div>
                <VSpacer />
                <div class="d-flex gap-x-4 align-center">
                    <VBtn color="primary" v-if="isPermission('register_pet')" prepend-icon="ri-add-line"
                        @click="router.push({ name: 'pet-daily-add' })">
                        Registrar Mascota (Diario)
                    </VBtn>
                </div>
            </VCardText>

            <VCardText class="pa-5">
                <VTable>
                    <thead>
                        <tr>
                            <th class="text-uppercase">Nombre</th>
                            <th class="text-uppercase">Especie</th>
                            <th class="text-uppercase">Raza</th>
                            <th class="text-uppercase">Genero</th>
                            <th class="text-uppercase">Peso</th>
                            <th class="text-uppercase">Color</th>
                            <th class="text-uppercase">Fecha</th>
                            <th class="text-uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in pets" :key="item.id">
                            <td>
                                <div class="d-flex align-center">
                                    <VAvatar size="32" :color="item.photo ? '' : 'primary'"
                                        :class="item.photo ? '' : 'v-avatar-light-bg primary--text'"
                                        :variant="!item.photo ? 'tonal' : undefined">
                                        <VImg v-if="item.photo" :src="item.photo" />
                                        <span v-else class="text-sm">{{ avatarText(item.name) }}</span>
                                    </VAvatar>
                                    <div class="d-flex flex-column ms-3">
                                        <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{
                                            item.name }}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{{ item.specie }}</td>
                            <td>{{ item.breed }}</td>
                            <td>{{ item.gender }}</td>
                            <td>{{ item.weight }} KG</td>
                            <td>{{ item.color }}</td>
                            <td>{{ item.created_at }}</td>
                            <td>
                                <div class="d-flex gap-1">
                                    <IconBtn size="small" v-if="isPermission('edit_pet')" @click="editItem(item)"
                                        title="Editar">
                                        <VIcon icon="ri-pencil-line" />
                                    </IconBtn>
                                    <IconBtn size="small" v-if="isPermission('delete_pet')" @click="deleteItem(item)"
                                        title="Quitar de la lista de hoy">
                                        <VIcon icon="ri-close-circle-line" color="warning" />
                                    </IconBtn>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </VTable>
                <VPagination v-model="currentPage" :length="totalPage" class="mt-4" />
            </VCardText>
        </VCard>
    </div>
</template>

<style scoped>
.v-btn__prepend {
    margin-inline: 0 !important;
}
</style>
