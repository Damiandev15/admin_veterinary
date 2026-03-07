<script setup>
import Swal from 'sweetalert2'


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  medicalRecord: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'addPayment'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const form = ref({
  method_payment: 'EFECTIVO',
  amount: 0,
})

const isPasswordVisible = ref(false)


const method_payments = ref([
  "EFECTIVO",
  "DIVISAS",
  "PAGO MOVIL",
  "PUNTO DE VENTA",
  "TRANSFERENCIA",
  "ZELLE",
  "USDT",
])

const medical_record_selected = ref(null)

const fieldsClean = () => {
  form.value = {
    method_payment: 'EFECTIVO',
    amount: 0,
  }
}

const store = async () => {
  if (!form.value.method_payment) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un metodo de pago para el registro" })
    
    return
  }

  if (!form.value.amount) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe digitar una monto para el pago" })
    
    return
  }


  let data = {
    method_payment: form.value.method_payment,
    amount: form.value.amount,
    appointment_id: medical_record_selected.value.appointment_id,
    vaccination_id: medical_record_selected.value.vaccination_id,
    surgerie_id: medical_record_selected.value.surgerie_id,
    medical_record_id: medical_record_selected.value.id,
  }
  try {
    const resp = await $api('/payments', {
      method: 'POST',
      body: data,
      onResponseError({ response }) {
        console.log(response)
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al procesar el pago' })
      },

    })

    console.log(resp)
    if (resp.message == 403) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: resp.message_text })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El pago se ha creado correctamente',
        showConfirmButton: false,
        timer: 1500,
      })
      fieldsClean()
      emit('update:isDialogVisible', false)
      emit('addPayment', resp.payment)
    }

  } catch (error) {
    console.log(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' })
  }

}

onMounted(() => {
  console.log(props.medicalRecord)
  medical_record_selected.value = props.medicalRecord
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="750"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Add Payment
          </h4>
          <!--
            <p class="text-sm-body-1 text-center">
            Supported payment methods
            </p> 
          -->
        </div>

        <VRow>
          <VCol cols="6">
            <VSelect
              v-model="form.method_payment"
              :items="method_payments"
              label="Metodos de pago"
              item-title="name"
              item-value="id"
              placeholder="Select Metodo"
              eager
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.amount"
              label="Monto:"
              type="number"
              placeholder="Monto de adelanto"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="pa-5">
        <VBtn
          color="primary"
          class="mb-4"
          @click="store"
        >
          Crear
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
