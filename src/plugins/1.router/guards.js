function parseJwt(token) {
  try {
    // Aquí separamos la segunda parte (el payload) que contiene los datos como la fecha de expiración
    const base64Url = token.split('.')[1] // Obtenemos el payload que está en formato base64Url

    // El formato base64Url usa '-' y '_' en lugar de '+' y '/' respectivamente
    // Necesitamos reemplazarlos para que sea decodificable en base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    // Decodificamos la cadena base64
    // atob() convierte la cadena base64 a texto legible
    // Luego usamos decodeURIComponent para manejar correctamente los caracteres especiales
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2) // Convertimos a formato URI
    }).join(''))

    // Finalmente convertimos el payload decodificado a un objeto JSON y lo retornamos
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

function isTokenExpired(token) {
  const decodedToken = parseJwt(token)
  if (!decodedToken || !decodedToken.exp) {
    return true // Token inválido o sin fecha de expiración
  }
  const currentTime = Math.floor(Date.now() / 1000) // Tiempo actual en segundos
  
  return decodedToken.exp < currentTime // Retorna true si el token ha expirado
}
export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    const isLoggedIn = !!(localStorage.getItem('user') && localStorage.getItem('token'))

    // If logged in as admin and trying to access landing page (/), redirect to dashboard
    if (isLoggedIn && to.path === '/') {
      return { name: 'dashboard' }
    }



    /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */
    if (to.meta.public || to.path.startsWith('/cliente/login') || to.path.startsWith('/cliente/register') || to.path.startsWith('/cliente/agenda'))
      return

    /**
         * Check if user is logged in by checking if token & user data exists in local storage
         * Feel free to update this logic to suit your needs
         */

    console.log(isLoggedIn)
    if (isLoggedIn && isTokenExpired(localStorage.getItem('token'))) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      }
    }

    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }
    console.log(to)
    if (to.meta.not_autenticacion == false) {
      return true
    }
    let USER = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
    if (USER && USER.role.name != 'Super-Admin') {
      // LA LISTA DE PERMISOS DEL USUARIO AUTENTICADO
      let permissions = USER.permissions

      // VALIDAMOS SI EL PERMISO QUE TIENE LA URL A LA QUE VAMOS A INGRESAR ES PARTE DE LOS PERMISOS DEL USUARIO AUTENTICADO
      console.log(permissions, to.meta.permisssio)
      if (permissions.includes(to.meta.permisssion) || to.meta.permisssion == "all") {
        return true
      } else {
        // CASO CONTRATIO NO TENGA LOS PERMISOS PARA INGRESAR A ESA VISTA ENTONCES LO MANDAREMOS A LA URL not-authorized
        return { name: 'not-authorized' }
      }
    }
    if (!isLoggedIn && to.matched.length) {
      /* eslint-disable indent */
      return isLoggedIn
        ? { name: 'not-authorized' }
        : {
          name: 'login',
          query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
          },
        }
      /* eslint-enable indent */
    }
  })
}
