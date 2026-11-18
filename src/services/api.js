import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  timeout: 15000,
})

export function withAuth(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(' ')
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (error?.response) return 'We could not complete that request. Please check the details and retry.'
  return 'The service could not be reached. Please check that the API is running.'
}
