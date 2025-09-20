import apiClient from "./apiClient"

const baseUrl = "/v1/authentication/token"

const login = async (credentials) => {
  const response = await apiClient.post(baseUrl, credentials)
  return response.data.data
}

export default { login }
