<script setup>
import Swal from 'sweetalert2';


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'addRole'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}
const LIST_PERMISSION = PERMISOS;
const role = ref(null);
const permissions = ref([]);


const addPermission = (permiso) => {
  let INDEX = permissions.value.findIndex((perm) => perm == permiso);
  if (INDEX != -1) {
    permissions.value.splice(INDEX, 1);
  } else {
    permissions.value.push(permiso);
  }
  console.log(permissions.value);
}

const store = async () => {
  if (!role.value) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el nombre del rol" });
    return;
  }

  if (permissions.value.length == 0) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar al menos un permiso" });
    return;
  }


  let data = {
    name: role.value,
    permissions: permissions.value,
  }

  try {
    const resp = await $api('/role', {
      method: 'POST',
      body: data,
      onResponseError({ response }) {
        console.log(response);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al crear el rol' });
      }
    })

    console.log(resp);
    if (resp.message == 403) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: resp.message_text });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El rol se ha creado correctamente',
        showConfirmButton: false,
        timer: 1500
      });
      role.value = null;
      permissions.value = [];
      emit('update:isDialogVisible', false);
      emit('addRole', true)
    }

  } catch (error) {
    console.log(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
  }

}
</script>

<template>
  <VDialog :model-value="props.isDialogVisible" max-width="750" @update:model-value="dialogVisibleUpdate">
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="emit('update:isDialogVisible', false)" />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Crear Rol
          </h4>
          <!-- <p class="text-sm-body-1 text-center">
            Supported payment methods
          </p> -->
        </div>

        <VTextField label="Rol:" v-model="role" placeholder="Example: Administrador" />


      </VCardText>
      <VCardText class="pa-5">
        <VBtn color="primary" class="mb-4" @click="store()">
          Crear
        </VBtn>
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                Modulo
              </th>
              <th class="text-uppercase">
                Permisos
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in LIST_PERMISSION" :key="index">
              <td>
                {{ item.name }}
              </td>
              <td>
                <ul>
                  <li v-for="(permiso, index2) in item.permisos" :key="index2" style="list-style: none;">
                    <VCheckbox :label="permiso.name" :value="permiso.permiso" @click="addPermission(permiso.permiso)" />
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </VTable>
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
