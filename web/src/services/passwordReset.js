import apiClient from './apiClient'

const forgotUrl = '/v1/authentication/forgot-password'
const resetUrl = '/v1/authentication/reset-password'

const requestReset = async (email) => {
  await apiClient.post(forgotUrl, { email })
}

const resetPassword = async (token, password) => {
  await apiClient.post(resetUrl, { token, password })
}

export default {
  requestReset,
  resetPassword,
}
