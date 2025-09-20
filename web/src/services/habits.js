import apiClient from "./apiClient"

const baseUrl = "/v1/habits"

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.post(baseUrl, newObject, config)
  return response.data.data
}

const update = async (id, updatedObject) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.patch(`${baseUrl}/${id}`, updatedObject, config)
  return response.data.data
}

const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.delete(`${baseUrl}/${id}`, config)
  return response.data.data
}

export default { create, update, remove, setToken }
