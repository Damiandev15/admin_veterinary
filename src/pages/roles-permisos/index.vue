<script setup>
import { isPermission } from '@/utils/constants'

// import data from '@/views/js/datatable'
const data = ref([])

const headers = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: 'Role',
    key: 'name',
  },
  {
    title: 'Permisos',
    key: 'permissions_pluck',
  },
  {
    title: 'Fecha',
    key: 'created_at',
  },
  {
    title: 'Op',
    key: 'action',
  },
]

const searchQuery = ref(null)
const role_selected = ref(null)
const role_selected_deleted = ref(null)
const isAddRoleDialogVisible = ref(false)
const isEditRoleDialogVisible = ref(false)
const isDeleteRoleDialogVisible = ref(false)

const list = async () => {
  const resp = await $api('/role?search=' + (searchQuery.value ? searchQuery.value : ''), {
    method: 'GET',
    onResponseError({ response }) {
      console.log(response)
    },
  })

  console.log(resp)

  data.value = resp.roles
}

const editItem = item => {
  isEditRoleDialogVisible.value = true
  role_selected.value = item
}

const deleteItem = item => {
  isDeleteRoleDialogVisible.value = true
  role_selected_deleted.value = item
}

onMounted(() => {
  list()
})
watch(isEditRoleDialogVisible, event => {
  console.log(event)
  if (event == false) {
    role_selected.value = null
  }
})
watch(isDeleteRoleDialogVisible, event => {
  console.log(event)
  if (event == false) {
    role_selected_deleted.value = null
  }
})

definePage({
  meta: {
    permisssion: 'list_rol',
  },
})
</script>

<template>
  <div>
    <VCard title="🔐 Roles y Permisos">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex align-center">
          <!-- 👉 Search  -->
          <VTextField
            v-model="searchQuery"
            placeholder="Search Role"
            style="inline-size: 300px;"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>

        <VSpacer />

        <div class="d-flex gap-x-4 align-center">
          <VBtn
            v-if="isPermission('register_rol')"
            color="primary"
            prepend-icon="ri-add-line"
            @click="isAddRoleDialogVisible = !isAddRoleDialogVisible"
          >
            Registrar Rol
          </VBtn>
        </div>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="data"
        :items-per-page="5"
        class="text-no-wrap"
      >
        <template #item.id="{ item }">
          <span class="text-h6">{{ item.id }}</span>
        </template>
        <template #item.permissions_pluck="{ item }">
          <ul>
            <li
              v-for="(permiso, index) in item.permissions_pluck"
              :key="index"
            >
              {{ permiso }}
            </li>
          </ul>
        </template>
        <template #item.action="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="isPermission('edit_rol')"
              size="small"
              @click="editItem(item)"
            >
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn
              v-if="isPermission('delete_rol')"
              size="small"
              @click="deleteItem(item)"
            >
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>

      <AddRoleDialog
        v-model:is-dialog-visible="isAddRoleDialogVisible"
        @add-role="list"
      />
      <EditRoleDialog
        v-if="role_selected"
        v-model:is-dialog-visible="isEditRoleDialogVisible"
        :rol-selected="role_selected"
        @add-role="list"
      />
      <DeleteRoleDialog
        v-if="role_selected_deleted"
        v-model:is-dialog-visible="isDeleteRoleDialogVisible"
        :rol-selected="role_selected_deleted"
        @add-role="list"
      />
    </VCard>
  </div>
</template>