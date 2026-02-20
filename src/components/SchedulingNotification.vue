<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Swal from 'sweetalert2'

const lastCount = ref(null)
const intervalId = ref(null)
const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Sonido de notificación

const checkNewSchedulings = async () => {
  // Solo chequear si el usuario está logueado como admin
  if (!localStorage.getItem('token'))
    return

  try {
    const resp = await $api('/client-schedulings', {
      method: 'GET',
      params: { status: 'PENDIENTE', perPage: 1 },
    })

    // Validar que schedulings existe antes de acceder a total
    if (!resp || !resp.schedulings)
      return

    const currentCount = resp.schedulings.total || 0

    if (lastCount.value !== null && currentCount > lastCount.value) {
      // Jugar sonido
      audio.play().catch(e => console.log('Auto-play blocked or error:', e))

      // Mostrar notificación
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: toast => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
          toast.onclick = () => {
            window.location.href = '/client-scheduling'
          }
        },
      })

      Toast.fire({
        icon: 'info',
        title: '¡Nueva solicitud!',
        text: 'Un cliente ha agendado una nueva cita.',
      })
    }

    lastCount.value = currentCount
  }
  catch (error) {
    console.error('Error polling schedulings:', error)
  }
}

onMounted(() => {
  checkNewSchedulings()

  // Polling cada 30 segundos
  intervalId.value = setInterval(checkNewSchedulings, 30000)
})

onUnmounted(() => {
  if (intervalId.value)
    clearInterval(intervalId.value)
})
</script>

<template>
  <!-- Componente invisible para manejo de notificaciones -->
  <div style="display: none;" />
</template>
