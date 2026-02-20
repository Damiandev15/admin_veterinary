<script setup>
import Swal from 'sweetalert2';


const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roles: {
    type: Object,
    required: true,
  },
  userSelected: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['update:isDialogVisible', 'editUser'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const form = ref({
  name: null,
  surname: null,
  email: null,
  phone: null,
  type_document: 'Cédula de Identidad',
  n_document: null,
  birthday: null,
  designation: null,
  gender: null,
  role_id: null,
  password: null,
});
const type_documents = [
  'Cédula de Identidad',
  'PASAPORTE',
  'CARNET DE EXTRANJERIA'
];
const isPasswordVisible = ref(false)
const FILE_AVATAR = ref(null);

const IMAGEN_PREVIZUALIZA = ref(null);
const roles = ref([]);

const update = async () => {
  if (!form.value.name) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el nombre del usuario" });
    return;
  }
  if (!form.value.surname) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el apellido del usuario" });
    return;
  }
  if (!form.value.email) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el email del usuario" });
    return;
  }
  if (!form.value.phone) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el telefono del usuario" });
    return;
  }
  if (!form.value.gender) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe llenar el genero del usuario" });
    return;
  }
  if (!form.value.role_id) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: "Se debe seleccionar un rol para el usuario" });
    return;
  }


  let formData = new FormData();

  formData.append("name", form.value.name);
  formData.append("surname", form.value.surname);
  formData.append("email", form.value.email);
  if (form.value.type_document) {
    formData.append("type_document", form.value.type_document);
  }
  if (form.value.n_document) {
    formData.append("n_document", form.value.n_document);
  }
  formData.append("phone", form.value.phone);
  formData.append("gender", form.value.gender);
  if (form.value.designation) {
    formData.append("designation", form.value.designation);
  }
  if (form.value.password) {
    formData.append("password", form.value.password);
  }
  formData.append("role_id", form.value.role_id);
  if (form.value.birthday) {
    formData.append("birthday", form.value.birthday);
  }
  if (FILE_AVATAR.value) {
    formData.append("imagen", FILE_AVATAR.value);
  }
  try {
    const resp = await $api('/staffs/' + props.userSelected.id, {
      method: 'POST',
      body: formData,
      onResponseError({ response }) {
        console.log(response);
        Swal.fire({ icon: 'error', title: 'Error', text: 'En el servidor hubo un error al guardar' });
      }
    })

    console.log(resp);
    if (resp.message == 403) {
      Swal.fire({ icon: 'error', title: 'Error', text: resp.message_text });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El usuario se ha editado correctamente',
        showConfirmButton: false,
        timer: 1500
      });

      const userLocal = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      console.log('Current user ID:', userLocal?.id, 'Updated user ID:', resp.user.id);

      if (userLocal && userLocal.id == resp.user.id) {
        console.log('Updating current user profile in localStorage');
        localStorage.setItem('user', JSON.stringify(resp.user));

        // Esperar un momento para asegurar que localStorage se actualice
        setTimeout(() => {
          console.log('Dispatching user-profile-updated event');
          window.dispatchEvent(new Event('user-profile-updated'));
        }, 100);
      }

      emit('editUser', resp.user)
    }

  } catch (error) {
    console.log(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error inesperado' });
  }

}

const loadFile = ($event) => {
  const file = $event.target.files ? $event.target.files[0] : (Array.isArray($event) ? $event[0] : $event);

  if (!file) return;

  if (file.type.indexOf("image") < 0) {
    FILE_AVATAR.value = null;
    IMAGEN_PREVIZUALIZA.value = null;
    Swal.fire({ icon: 'error', title: 'Error', text: "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN" });
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


onMounted(() => {
  roles.value = props.roles;
  form.value.name = props.userSelected.name;
  form.value.surname = props.userSelected.surname
  form.value.email = props.userSelected.email
  form.value.phone = props.userSelected.phone
  form.value.type_document = props.userSelected.type_document
  form.value.n_document = props.userSelected.n_document
  form.value.birthday = props.userSelected.birthday
  form.value.designation = props.userSelected.designation
  form.value.gender = props.userSelected.gender
  form.value.role_id = parseInt(props.userSelected.role_id)
  IMAGEN_PREVIZUALIZA.value = props.userSelected.avatar;
})
</script>

<template>
  <VDialog :model-value="props.isDialogVisible" max-width="750" @update:model-value="dialogVisibleUpdate">
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="emit('update:isDialogVisible', false)" />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            Editar Personal : {{ props.userSelected.id }}
          </h4>
        </div>


        <VRow>
          <VCol cols="6">
            <VTextField label="Nombre:" v-model="form.name" placeholder="Example: Rafael" />
          </VCol>
          <VCol cols="6">
            <VTextField label="Apellido:" v-model="form.surname" placeholder="Example: Mendoza" />
          </VCol>

          <VCol cols="4">
            <VTextField label="Telefono:" type="number" v-model="form.phone" placeholder="Example: 99999999" />
          </VCol>
          <VCol cols="4">
            <VSelect :items="type_documents" v-model="form.type_document" label="Tipo de documento"
              placeholder="Select Item" eager />
          </VCol>
          <VCol cols="4">
            <VTextField label="N° documento (Cédula):" type="number" v-model="form.n_document"
              placeholder="Ej: 12345678" />
          </VCol>


          <VCol cols="4">
            <VTextField v-model="form.birthday" label="Cumpleaños" type="date" placeholder="Selecciona fecha" />
          </VCol>
          <VCol cols="4">
            <VRadioGroup v-model="form.gender" inline>
              <VRadio label="Masculino" value="M" />
              <VRadio label="Femenino" value="F" />
            </VRadioGroup>
          </VCol>
          <VCol cols="4">
            <VTextarea v-model="form.designation" label="Designación" placeholder="Text" />
          </VCol>
          <VCol cols="6">
            <VRow>
              <VCol cols="12">
                <VFileInput label="Cambiar Foto" @change="loadFile($event)" accept=".jpg,.jpeg,.png" />
              </VCol>
              <VCol cols="12" v-if="IMAGEN_PREVIZUALIZA">
                <div class="border rounded d-flex align-center justify-center p-1"
                  style="min-height: 180px; background: #2f3349; overflow: hidden; width: 150px;">
                  <img :src="IMAGEN_PREVIZUALIZA" style="width: 100%; height: 180px; object-fit: cover;"
                    class="rounded" />
                </div>
              </VCol>
            </VRow>
          </VCol>

          <VCol cols="6">
            <VSelect :items="roles" v-model="form.role_id" label="Rol" item-title="name" item-value="id"
              placeholder="Select Rol" eager />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.email" label="Email" type="email" placeholder="johndoe@email.com" />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="form.password" label="Password" placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible" />
          </VCol>
        </VRow>


      </VCardText>
      <VCardText class="pa-5">
        <VBtn color="primary" class="mb-4" @click="update()">
          Editar
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
