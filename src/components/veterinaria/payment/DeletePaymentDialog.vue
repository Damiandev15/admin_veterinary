<script setup>
import Swal from 'sweetalert2';


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  medicalRecord: {
    type: Object,
    required: true,
  },
  paymentSelected: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['update:isDialogVisible', 'deletePayment'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const medical_record_selected = ref(null);


const deleted = async () => {
  try {
    const resp = await $api('/payments/' + props.paymentSelected.id + "?appointment_id=" + (medical_record_selected.value.appointment_id ?? '') +
      "&vaccination_id=" + (medical_record_selected.value.vaccination_id ?? '') +
      "&surgerie_id=" + (medical_record_selected.value.surgerie_id ?? '') +
      "&medical_record_id=" + medical_record_selected.value.id, {
      method: 'DELETE',
      onResponseError({ response }) {
        console.log(response);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el pago' });
      }

    })
    console.log(resp);
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'El pago se ha eliminado correctamente',
      showConfirmButton: false,
      timer: 1500
    });
    emit('deletePayment', resp.payment)
    emit('update:isDialogVisible', false)

  } catch (error) {
    console.log(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
  }

}

onMounted(() => {
  medical_record_selected.value = props.medicalRecord;
  console.log(medical_record_selected.value, props.paymentSelected);
})
</script>

<template>
  <VDialog :model-value="props.isDialogVisible" max-width="750" @update:model-value="dialogVisibleUpdate">
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="emit('update:isDialogVisible', false)" />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2" v-if="medical_record_selected">
            Deleted Payment : {{ props.paymentSelected.id + ' ' + props.paymentSelected.method_payment }}
          </h4>
          <!-- <p class="text-sm-body-1 text-center">
            Supported payment methods
          </p> -->
        </div>
        <p v-if="medical_record_selected">¿Estas seguro de eliminar el PAGO "{{ props.paymentSelected.amount }} BS"?
        </p>

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
