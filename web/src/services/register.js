import apiClient from "./apiClient"

const baseUrl = "/v1/authentication/user"

const register = async (credentials) => {
  const response = await apiClient.post(baseUrl, credentials)
  return response.data.data
}

export default { register }
