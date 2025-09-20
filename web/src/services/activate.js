import apiClient from "./apiClient"

const baseUrl = "/v1/users/activate"

const activate = async (token) => {
  const response = await apiClient.put(`${baseUrl}/${token}`)
  return response.data.data
}

export default { activate }
