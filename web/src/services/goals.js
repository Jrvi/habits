import apiClient from './apiClient'

const baseUrl = '/v1/goals'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getByYear = async (year) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.get(`${baseUrl}/year/${year}`, config)
  return response.data.data
}

const create = async (goalData) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.post(baseUrl, goalData, config)
  return response.data.data
}

const update = async (id, goalData) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.patch(`${baseUrl}/${id}`, goalData, config)
  return response.data.data
}

const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  }
  await apiClient.delete(`${baseUrl}/${id}`, config)
}

const getById = async (id) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.get(`${baseUrl}/${id}`, config)
  return response.data.data
}

export default {
  getByYear,
  create,
  update,
  remove,
  getById,
  setToken,
}
