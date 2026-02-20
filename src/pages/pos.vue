<script setup>
import Swal from 'sweetalert2';
import { ref, onMounted, computed } from 'vue';
import { formatCurrency } from '@/utils/currencyFormatter';

const products = ref([]);
const clients = ref([]);
const loading = ref(false);
const searchProduct = ref('');
const cart = ref([]);
const selectedClient = ref(null);
const paymentMethod = ref('efectivo');

const paymentMethods = [
    { title: 'Efectivo', value: 'efectivo' },
    { title: 'Divisas', value: 'divisas' },
    { title: 'Transferencia', value: 'transferencia' },
    { title: 'Punto de Venta', value: 'punto_venta' },
    { title: 'Pago Móvil', value: 'pago_movil' },
    { title: 'Zelle', value: 'zelle' },
    { title: 'USDT', value: 'usdt' },
];

const filteredProducts = computed(() => {
    if (!searchProduct.value) return products.value;

    return products.value.filter(p =>
        p.name.toLowerCase().includes(searchProduct.value.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchProduct.value.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchProduct.value.toLowerCase()))
    );
});

const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.total, 0);
});

const loadProducts = async () => {
    loading.value = true;
    try {
        const resp = await $api('/inventory', {
            method: 'GET',
        });
        products.value = resp.products.filter(p => p.stock > 0);
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

const loadClients = async () => {
    try {
        const resp = await $api('/pets', {
            method: 'GET',
        });
        // Extraer owners únicos
        const ownersMap = new Map();
        resp.pets.forEach(pet => {
            if (pet.owner && !ownersMap.has(pet.owner.id)) {
                ownersMap.set(pet.owner.id, {
                    id: pet.owner.id,
                    full_name: `${pet.owner.first_name} ${pet.owner.last_name}`,
                    phone: pet.owner.phone,
                });
            }
        });
        clients.value = Array.from(ownersMap.values());
    } catch (error) {
        console.error(error);
    }
};

const addToCart = (product) => {
    const existingItem = cart.value.find(item => item.product_id === product.id);

    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Insuficiente',
                text: `Solo hay ${product.stock} unidades disponibles`,
            });
            return;
        }
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.unit_price;
    } else {
        cart.value.push({
            product_id: product.id,
            name: product.name,
            sku: product.sku,
            unit_price: parseFloat(product.sale_price),
            quantity: 1,
            total: parseFloat(product.sale_price),
            max_stock: product.stock,
        });
    }
};

const updateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
        removeFromCart(item);
        return;
    }

    if (newQuantity > item.max_stock) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock Insuficiente',
            text: `Solo hay ${item.max_stock} unidades disponibles`,
        });
        return;
    }

    item.quantity = newQuantity;
    item.total = item.quantity * item.unit_price;
};

const removeFromCart = (item) => {
    const index = cart.value.findIndex(i => i.product_id === item.product_id);
    if (index !== -1) {
        cart.value.splice(index, 1);
    }
};

const clearCart = () => {
    cart.value = [];
    selectedClient.value = null;
    paymentMethod.value = 'efectivo';
};

const processSale = async () => {
    if (cart.value.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito Vacío',
            text: 'Agregue productos al carrito antes de procesar la venta',
        });
        return;
    }

    try {
        const saleData = {
            client_id: selectedClient.value,
            payment_method: paymentMethod.value,
            items: cart.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
            })),
        };

        const resp = await $api('/sales', {
            method: 'POST',
            body: JSON.stringify(saleData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        Swal.fire({
            icon: 'success',
            title: '¡Venta Procesada!',
            html: `
                <div style="text-align: left;">
                    <p><strong>Total:</strong> ${formatCurrency(cartTotal.value, paymentMethod.value)}</p>
                    <p><strong>Método de Pago:</strong> ${paymentMethods.find(m => m.value === paymentMethod.value)?.title}</p>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Aceptar',
        });

        clearCart();
        loadProducts(); // Recargar productos para actualizar stock

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.data?.message || 'Error al procesar la venta',
        });
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

onMounted(() => {
    loadProducts();
    loadClients();
});

definePage({
    meta: {
        permission: 'all'
    },
});
</script>

<template>
    <div>
        <VRow>
            <!-- Panel Izquierdo: Catálogo de Productos -->
            <VCol cols="12" md="7">
                <VCard>
                    <VCardText>
                        <h5 class="text-h5 mb-4">🛒 Catálogo de Productos</h5>

                        <VTextField v-model="searchProduct" label="Buscar Producto" placeholder="Nombre, SKU o Marca..."
                            prepend-inner-icon="ri-search-line" clearable class="mb-4" />

                        <div v-if="loading" class="text-center py-5">
                            <VProgressCircular indeterminate color="primary" />
                        </div>

                        <VRow v-else>
                            <VCol v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" md="4">
                                <VCard class="product-card cursor-pointer" @click="addToCart(product)" hover>
                                    <VImg v-if="product.image_path" :src="product.image_path" height="150" cover />
                                    <div v-else class="d-flex align-center justify-center"
                                        style="height: 150px; background: #2f3349;">
                                        <VIcon icon="ri-image-line" size="48" />
                                    </div>

                                    <VCardText>
                                        <div class="d-flex justify-space-between align-center mb-2">
                                            <VChip :color="getCategoryColor(product.category)" size="x-small">
                                                {{ product.category }}
                                            </VChip>
                                            <VChip color="success" size="x-small">
                                                Stock: {{ product.stock }}
                                            </VChip>
                                        </div>
                                        <h6 class="text-h6 mb-1">{{ product.name }}</h6>
                                        <p class="text-caption mb-2" v-if="product.brand">{{ product.brand }}</p>
                                        <div class="text-h6 text-primary font-weight-bold">
                                            {{ formatCurrency(product.sale_price, 'efectivo') }}
                                        </div>
                                    </VCardText>
                                </VCard>
                            </VCol>
                        </VRow>

                        <div v-if="!loading && filteredProducts.length === 0" class="text-center py-5">
                            <p class="text-disabled">No hay productos disponibles</p>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <!-- Panel Derecho: Carrito de Compras -->
            <VCol cols="12" md="5">
                <VCard class="sticky-cart">
                    <VCardText>
                        <h5 class="text-h5 mb-4">🛍️ Carrito de Compras</h5>

                        <!-- Selección de Cliente -->
                        <VAutocomplete v-model="selectedClient" :items="clients" item-title="full_name" item-value="id"
                            label="Cliente (Opcional)" placeholder="Seleccione un cliente..." clearable class="mb-4">
                            <template #item="{ props, item }">
                                <VListItem v-bind="props">
                                    <template #subtitle>
                                        {{ item.raw.phone }}
                                    </template>
                                </VListItem>
                            </template>
                        </VAutocomplete>

                        <!-- Items del Carrito -->
                        <div class="cart-items mb-4" style="max-height: 400px; overflow-y: auto;">
                            <div v-if="cart.length === 0" class="text-center py-5">
                                <VIcon icon="ri-shopping-cart-line" size="48" class="text-disabled mb-2" />
                                <p class="text-disabled">Carrito vacío</p>
                            </div>

                            <VCard v-for="item in cart" :key="item.product_id" class="mb-2" variant="outlined">
                                <VCardText class="pa-3">
                                    <div class="d-flex justify-space-between align-center mb-2">
                                        <h6 class="text-subtitle-1 font-weight-bold">{{ item.name }}</h6>
                                        <VBtn icon size="x-small" variant="text" color="error"
                                            @click="removeFromCart(item)">
                                            <VIcon icon="ri-close-line" />
                                        </VBtn>
                                    </div>
                                    <div class="d-flex justify-space-between align-center">
                                        <div class="d-flex align-center gap-2">
                                            <VBtn icon size="x-small" @click="updateQuantity(item, item.quantity - 1)">
                                                <VIcon icon="ri-subtract-line" />
                                            </VBtn>
                                            <VTextField :model-value="item.quantity"
                                                @update:model-value="updateQuantity(item, parseInt($event) || 0)"
                                                type="number" hide-details density="compact" style="width: 60px;"
                                                class="text-center" />
                                            <VBtn icon size="x-small" @click="updateQuantity(item, item.quantity + 1)">
                                                <VIcon icon="ri-add-line" />
                                            </VBtn>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-caption">{{ formatCurrency(item.unit_price, paymentMethod)
                                            }} c/u</div>
                                            <div class="text-h6 font-weight-bold text-primary">
                                                {{ formatCurrency(item.total, paymentMethod) }}
                                            </div>
                                        </div>
                                    </div>
                                </VCardText>
                            </VCard>
                        </div>

                        <!-- Método de Pago -->
                        <VSelect v-model="paymentMethod" :items="paymentMethods" label="Método de Pago" class="mb-4" />

                        <!-- Total -->
                        <VDivider class="my-4" />
                        <div class="d-flex justify-space-between align-center mb-4">
                            <h5 class="text-h5">Total a Pagar:</h5>
                            <h4 class="text-h4 text-primary font-weight-bold">
                                {{ formatCurrency(cartTotal, paymentMethod) }}
                            </h4>
                        </div>

                        <!-- Botones de Acción -->
                        <VRow>
                            <VCol cols="6">
                                <VBtn block color="secondary" variant="outlined" @click="clearCart"
                                    :disabled="cart.length === 0">
                                    <VIcon icon="ri-delete-bin-line" class="me-2" />
                                    Limpiar
                                </VBtn>
                            </VCol>
                            <VCol cols="6">
                                <VBtn block color="primary" @click="processSale" :disabled="cart.length === 0">
                                    <VIcon icon="ri-shopping-bag-line" class="me-2" />
                                    Procesar Venta
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>

<style scoped>
.product-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.cursor-pointer {
    cursor: pointer;
}

.sticky-cart {
    position: sticky;
    top: 20px;
}

.gap-2 {
    gap: 8px;
}

.gap-4 {
    gap: 16px;
}
</style>
