<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted, computed } from 'vue';
import { formatCurrency } from '@/utils/currencyFormatter';

const products = ref([]);
const loading = ref(false);
const dialog = ref(false);
const isEditing = ref(false);
const search = ref('');
const categoryFilter = ref('');

const form = ref({
    id: null,
    name: '',
    sku: '',
    category: '',
    brand: '',
    cost_price: 0,
    sale_price: 0,
    stock: 0,
    min_stock: 5,
    expiry_date: null,
    content_detail: '',
});

const categories = [
    { title: 'Medicina', value: 'medicina' },
    { title: 'Alimento', value: 'alimento' },
    { title: 'Accesorio', value: 'accesorio' },
];

const FILE_IMAGE = ref(null);
const IMAGE_PREVIEW = ref(null);

const loadFile = ($event) => {
    const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event);

    if (!file) return;

    if (file.type.indexOf("image") < 0) {
        FILE_IMAGE.value = null;
        IMAGE_PREVIEW.value = null;
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN',
        });
        return;
    }

    FILE_IMAGE.value = file;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        IMAGE_PREVIEW.value = reader.result;
    };
};

const removeImage = () => {
    FILE_IMAGE.value = null;
    IMAGE_PREVIEW.value = null;
};

const showExpiryDate = computed(() => {
    return form.value.category === 'medicina' || form.value.category === 'alimento';
});

const filteredProducts = computed(() => {
    let filtered = products.value;

    if (search.value) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.value.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(search.value.toLowerCase())) ||
            (p.brand && p.brand.toLowerCase().includes(search.value.toLowerCase()))
        );
    }

    if (categoryFilter.value) {
        filtered = filtered.filter(p => p.category === categoryFilter.value);
    }

    return filtered;
});

const loadProducts = async () => {
    loading.value = true;
    try {
        const resp = await $api('/inventory', {
            method: 'GET',
        });
        products.value = resp.products;
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los productos',
        });
    } finally {
        loading.value = false;
    }
};

const openDialog = (product = null) => {
    if (product) {
        isEditing.value = true;
        form.value = {
            id: product.id,
            name: product.name,
            sku: product.sku || '',
            category: product.category,
            brand: product.brand || '',
            cost_price: product.cost_price,
            sale_price: product.sale_price,
            stock: product.stock,
            min_stock: product.min_stock,
            expiry_date: product.expiry_date || null,
            content_detail: product.content_detail || '',
        };
        IMAGE_PREVIEW.value = product.image_path;
    } else {
        isEditing.value = false;
        resetForm();
    }
    dialog.value = true;
};

const resetForm = () => {
    form.value = {
        id: null,
        name: '',
        sku: '',
        category: '',
        brand: '',
        cost_price: 0,
        sale_price: 0,
        stock: 0,
        min_stock: 5,
        expiry_date: null,
        content_detail: '',
    };
    FILE_IMAGE.value = null;
    IMAGE_PREVIEW.value = null;
};

const saveProduct = async () => {
    try {
        if (!form.value.name || !form.value.category || !form.value.sale_price) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Complete los campos obligatorios',
            });
            return;
        }

        if (showExpiryDate.value && !form.value.expiry_date) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'La fecha de vencimiento es obligatoria para medicinas y alimentos',
            });
            return;
        }

        let formData = new FormData();
        formData.append("name", form.value.name);
        if (form.value.sku) formData.append("sku", form.value.sku);
        formData.append("category", form.value.category);
        if (form.value.brand) formData.append("brand", form.value.brand);
        formData.append("cost_price", form.value.cost_price);
        formData.append("sale_price", form.value.sale_price);
        formData.append("stock", form.value.stock);
        formData.append("min_stock", form.value.min_stock);
        if (form.value.expiry_date) formData.append("expiry_date", form.value.expiry_date);
        if (form.value.content_detail) formData.append("content_detail", form.value.content_detail);
        if (FILE_IMAGE.value) formData.append("image", FILE_IMAGE.value);

        if (isEditing.value) {
            formData.append("_method", "PUT");
            await $api(`/inventory/${form.value.id}`, {
                method: 'POST',
                body: formData,
            });
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Producto actualizado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            await $api('/inventory', {
                method: 'POST',
                body: formData,
            });
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Producto creado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        }

        dialog.value = false;
        resetForm();
        loadProducts();

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || 'Error al guardar el producto',
        });
    }
};

const deleteProduct = async (id) => {
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await $api(`/inventory/${id}`, {
                method: 'DELETE',
            });
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Producto eliminado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
            loadProducts();
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar el producto',
            });
        }
    }
};

const getCategoryColor = (category) => {
    const colors = {
        medicina: 'error',
        alimento: 'success',
        accesorio: 'info',
    };
    return colors[category] || 'default';
};

const getCategoryLabel = (category) => {
    const labels = {
        medicina: 'Medicina',
        alimento: 'Alimento',
        accesorio: 'Accesorio',
    };
    return labels[category] || category;
};

onMounted(() => {
    loadProducts();
});

definePage({
    meta: {
        permission: 'all'
    },
});
</script>

<template>
    <div>
        <VCard>
            <VCardText>
                <div class="d-flex justify-space-between align-center mb-4">
                    <h4 class="text-h4">📦 Inventario de Productos</h4>
                    <VBtn color="primary" @click="openDialog()">
                        <VIcon icon="ri-add-line" class="me-2" />
                        Nuevo Producto
                    </VBtn>
                </div>

                <VRow class="mb-4">
                    <VCol cols="12" md="6">
                        <VTextField v-model="search" label="Buscar" placeholder="Nombre, SKU o Marca..."
                            prepend-inner-icon="ri-search-line" clearable />
                    </VCol>
                    <VCol cols="12" md="3">
                        <VSelect v-model="categoryFilter" :items="categories" label="Filtrar por Categoría" clearable />
                    </VCol>
                </VRow>

                <VTable>
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>SKU</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Marca</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="9" class="text-center py-5">
                                <VProgressCircular indeterminate color="primary" />
                            </td>
                        </tr>
                        <tr v-else-if="filteredProducts.length === 0">
                            <td colspan="9" class="text-center py-5">
                                No hay productos registrados
                            </td>
                        </tr>
                        <tr v-else v-for="product in filteredProducts" :key="product.id">
                            <td>
                                <VAvatar size="40" rounded>
                                    <VImg v-if="product.image_path" :src="product.image_path" />
                                    <VIcon v-else icon="ri-image-line" />
                                </VAvatar>
                            </td>
                            <td>{{ product.sku || '-' }}</td>
                            <td>{{ product.name }}</td>
                            <td>
                                <VChip :color="getCategoryColor(product.category)" size="small">
                                    {{ getCategoryLabel(product.category) }}
                                </VChip>
                            </td>
                            <td>{{ product.brand || '-' }}</td>
                            <td class="font-weight-bold">{{ formatCurrency(product.sale_price, 'efectivo') }}</td>
                            <td>
                                <VChip :color="product.is_low_stock ? 'error' : 'success'" size="small">
                                    {{ product.stock }}
                                    <span v-if="product.is_low_stock" class="ms-1">⚠️</span>
                                </VChip>
                            </td>
                            <td>
                                <span v-if="product.expiry_date" :class="product.is_expiring_soon ? 'text-error' : ''">
                                    {{ product.expiry_date }}
                                    <VIcon v-if="product.is_expiring_soon" icon="ri-alarm-warning-line" size="small"
                                        color="error" />
                                </span>
                                <span v-else>-</span>
                            </td>
                            <td>
                                <VBtn icon size="small" variant="text" @click="openDialog(product)">
                                    <VIcon icon="ri-edit-line" />
                                </VBtn>
                                <VBtn icon size="small" variant="text" color="error" @click="deleteProduct(product.id)">
                                    <VIcon icon="ri-delete-bin-line" />
                                </VBtn>
                            </td>
                        </tr>
                    </tbody>
                </VTable>
            </VCardText>
        </VCard>

        <!-- Modal de Producto -->
        <VDialog v-model="dialog" max-width="800px" persistent>
            <VCard>
                <VCardTitle class="pa-5">
                    <h5 class="text-h5">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
                </VCardTitle>
                <VCardText class="pa-5">
                    <VRow>
                        <VCol cols="12" md="6">
                            <VTextField v-model="form.name" label="Nombre *" placeholder="Ej: Vacuna Antirrábica" />
                        </VCol>
                        <VCol cols="12" md="6">
                            <VTextField v-model="form.sku" label="SKU / Código de Barras" placeholder="Opcional" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VSelect v-model="form.category" :items="categories" label="Categoría *" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.brand" label="Marca" placeholder="Opcional" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.content_detail" label="Detalle de Contenido"
                                placeholder="Ej: 500ml, 1kg" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.cost_price" label="Precio de Costo" type="number" step="0.01" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.sale_price" label="Precio de Venta *" type="number" step="0.01" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.stock" label="Stock *" type="number" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <VTextField v-model="form.min_stock" label="Stock Mínimo" type="number" />
                        </VCol>
                        <VCol v-if="showExpiryDate" cols="12" md="4">
                            <label>Fecha de Vencimiento *</label>
                            <input type="date" class="v-field__input w-100 border p-2 rounded"
                                v-model="form.expiry_date">
                        </VCol>
                        <VCol cols="12" md="4">
                            <VFileInput label="Imagen del Producto" @change="loadFile($event)"
                                accept=".jpg,.jpeg,.png" />
                        </VCol>
                        <VCol v-if="IMAGE_PREVIEW" cols="12" md="4">
                            <div class="border rounded d-flex align-center justify-center p-1 position-relative"
                                style="min-height: 150px; background: #2f3349; overflow: hidden;">
                                <img :src="IMAGE_PREVIEW" style="width: 100%; height: 150px; object-fit: cover;"
                                    class="rounded" />
                                <span class="position-absolute cursor-pointer text-white"
                                    style="top: 5px; right: 8px; font-size: 24px; text-shadow: 0 0 3px rgba(0,0,0,0.8); z-index: 10; line-height: 1;"
                                    @click="removeImage">×</span>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
                <VCardActions class="pa-5">
                    <VSpacer />
                    <VBtn color="secondary" variant="outlined" @click="dialog = false; resetForm();">
                        Cancelar
                    </VBtn>
                    <VBtn color="primary" @click="saveProduct">
                        {{ isEditing ? 'Actualizar' : 'Guardar' }}
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
