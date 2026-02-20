<script setup>
import Swal from 'sweetalert2';


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  userSelected: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['update:isDialogVisible', 'deleteUser'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const user_selected = ref(null);


const deleted = async () => {
  try {
    const resp = await $api('/veterinaries/' + user_selected.value.id, {
      method: 'DELETE',
      onResponseError({ response }) {
        console.log(response);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el veterinario' });
      }

    })
    console.log(resp);
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'El veterinario se ha eliminado correctamente',
      showConfirmButton: false,
      timer: 1500
    });
    emit('deleteUser', user_selected.value)
    emit('update:isDialogVisible', false)

  } catch (error) {
    console.log(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
  }

}

onMounted(() => {
  user_selected.value = props.userSelected;
  console.log(user_selected.value);
})
</script>

<template>
  <VDialog :model-value="props.isDialogVisible" max-width="750" @update:model-value="dialogVisibleUpdate">
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="emit('update:isDialogVisible', false)" />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2" v-if="user_selected">
            Deleted Veterinarie : {{ user_selected.id }}
          </h4>
          <!-- <p class="text-sm-body-1 text-center">
            Supported payment methods
          </p> -->
        </div>
        <p v-if="user_selected">¿Estas seguro de eliminar el VETERINARI@ "{{ user_selected.full_name }}"?</p>

      </VCardText>
      <VCardText class="pa-5">
        <VBtn color="error" class="mb-4" @click="deleted()">
          Eliminar
        </VBtn>
      </VCardText>

    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
