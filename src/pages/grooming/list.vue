<script setup>
import { isPermission } from '@/utils/constants'

const router = useRouter()
const searchQuery = ref(null)
const pets = ref([])
const currentPage = ref(1)
const totalPage = ref(1)

const list = async () => {
  const resp = await $api('/groomings?page=' + currentPage.value + '&search=' + (searchQuery.value ? searchQuery.value : ''), {
    method: 'GET',
  })

  totalPage.value = resp.total_page
  pets.value = resp.pets.data
}

const editItem = item => {
  router.push('/grooming/edit/' + item.id)
}

const reset = () => {
  searchQuery.value = null
  currentPage.value = 1
  list()
}

const avatarText = value => {
  if (!value) return ''
  const nameArray = value.split(' ')
  
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

watch(currentPage, val => {
  list()
})

onMounted(() => {
  list()
})

definePage({
  meta: {
    permisssion: 'list_pet',
  },
})
</script>

<template>
  <div>
    <VCard title="✂️ Peluquería">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex align-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Buscar Mascota o Propietario"
            style="inline-size: 300px;"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>
        <div>
          <VBtn
            color="info"
            class="mx-1"
            prepend-icon="ri-search-2-line"
            @click="list"
          />
          <VBtn
            color="secondary"
            class="mx-1"
            prepend-icon="ri-restart-line"
            @click="reset"
          />
        </div>
        <VSpacer />

        <div class="d-flex gap-x-4 align-center">
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            @click="router.push({ name: 'grooming-add' })"
          >
            Registrar en Peluquería
          </VBtn>
        </div>
      </VCardText>

      <VCardText class="pa-5">
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                Mascota
              </th>
              <th class="text-uppercase">
                Tipo de Corte
              </th>
              <th class="text-uppercase">
                Estilo de Cara
              </th>
              <th class="text-uppercase">
                Servicios
              </th>
              <th class="text-uppercase">
                Propietario
              </th>
              <th class="text-uppercase">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in pets"
              :key="item.id"
            >
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="32"
                    :color="item.photo ? '' : 'primary'"
                    :class="item.photo ? '' : 'v-avatar-light-bg primary--text'"
                    :variant="!item.photo ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="item.photo"
                      :src="item.photo"
                    />
                    <span
                      v-else
                      class="text-sm"
                    >{{ avatarText(item.name) }}</span>
                  </VAvatar>
                  <div class="d-flex flex-column ms-3">
                    <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{
                      item.name }}</span>
                    <span class="text-caption text-medium-emphasis">{{ item.breed }}</span>
                  </div>
                </div>
              </td>
              <td>
                {{ item.grooming?.grooming_cut_type || '-' }}
              </td>
              <td>
                {{ item.grooming?.grooming_face_style || '-' }}
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <VChip
                    v-for="service in (item.grooming?.grooming_services || [])"
                    :key="service"
                    size="x-small"
                  >
                    {{ service }}
                  </VChip>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="font-weight-medium">{{ item.owner.first_name }} {{ item.owner.last_name
                  }}</span>
                  <span class="text-caption">{{ item.owner.phone }}</span>
                </div>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <IconBtn
                    size="small"
                    @click="editItem(item)"
                  >
                    <VIcon icon="ri-pencil-line" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <VPagination
          v-model="currentPage"
          :length="totalPage"
        />
      </VCardText>
    </VCard>
  </div>
</template>
