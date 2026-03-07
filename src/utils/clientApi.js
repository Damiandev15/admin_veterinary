import { ofetch } from 'ofetch'

export const $clientApi = ofetch.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api') + '/cliente',
  async onRequest({ options }) {
    const accessToken = localStorage.getItem("client_token")
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },
})
