import apiClient from './apiClient'

const baseUrl = '/v1/users/me'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getTokenFromStorage = () => {
  try {
    const raw = window.localStorage.getItem('loggedHabitAppUser')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token) return null
    return `Bearer ${parsed.token}`
  } catch {
    return null
  }
}

const getConfig = () => {
  const auth = token || (typeof window !== 'undefined' ? getTokenFromStorage() : null)
  return {
    headers: { Authorization: auth },
  }
}

const getMe = async () => {
  const response = await apiClient.get(baseUrl, getConfig())
  return response.data.data
}

const updateEmail = async (email, currentPassword) => {
  const response = await apiClient.patch(
    `${baseUrl}/email`,
    { email, currentPassword },
    getConfig()
  )
  return response.data.data
}

const updatePassword = async (currentPassword, newPassword) => {
  await apiClient.patch(
    `${baseUrl}/password`,
    { currentPassword, newPassword },
    getConfig()
  )
}

export default {
  setToken,
  getMe,
  updateEmail,
  updatePassword,
}
