<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import avatar1 from '@images/avatars/avatar-1.png'

const user = ref(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)
const router = useRouter()

const userName = computed(() => {
  if (!user.value) return ''
  
  return `${user.value.name} ${user.value.surname}`
})

const userRole = computed(() => {
  if (!user.value || !user.value.role) return ''
  
  return user.value.role.name
})

const logout = async () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  await router.push("/login")
}

const syncUser = () => {
  const updatedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  console.log('Syncing user profile:', updatedUser)

  // Forzar reactividad creando un nuevo objeto
  user.value = updatedUser ? { ...updatedUser } : null
}

onMounted(() => {
  window.addEventListener('user-profile-updated', syncUser)
  console.log('User profile mounted. User data:', user.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('user-profile-updated', syncUser)
})
</script>


<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
    >
      <img
        :src="avatar1"
        style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"
      >


      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <VListItem class="px-4">
            <div
              v-if="user"
              class="d-flex gap-x-2 align-center"
            >
              <VAvatar>
                <img
                  :src="avatar1"
                  style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"
                >
              </VAvatar>


              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  {{ userName }}
                </div>
                <div class="text-capitalize text-caption text-disabled">
                  {{ userRole }}
                </div>
              </div>
            </div>
          </VListItem>

          <VListItem class="px-4">
            <VBtn
              block
              color="error"
              size="small"
              append-icon="ri-logout-box-r-line"
              @click="logout"
            >
              Logout
            </VBtn>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
