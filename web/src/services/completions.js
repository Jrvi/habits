import apiClient from './apiClient'

const baseUrl = '/v1'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const markComplete = async (habitId, date) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await apiClient.post(
    `${baseUrl}/habits/${habitId}/complete`,
    { date },
    config
  )
  return response.data.data
}

const unmarkComplete = async (habitId, date) => {
  const config = {
    headers: { Authorization: token },
  }
  await apiClient.delete(
    `${baseUrl}/habits/${habitId}/complete/${date}`,
    config
  )
}

const getHabitCompletions = async (habitId, startDate, endDate) => {
  const config = {
    headers: { Authorization: token },
  }
  const params = new URLSearchParams()
  if (startDate) params.append('start', startDate)
  if (endDate) params.append('end', endDate)
  
  const response = await apiClient.get(
    `${baseUrl}/habits/${habitId}/completions?${params.toString()}`,
    config
  )
  return response.data.data || []
}

const getUserCompletions = async (startDate, endDate) => {
  const config = {
    headers: { Authorization: token },
  }
  const params = new URLSearchParams()
  if (startDate) params.append('start', startDate)
  if (endDate) params.append('end', endDate)
  
  const response = await apiClient.get(
    `${baseUrl}/completions?${params.toString()}`,
    config
  )
  return response.data.data || []
}

export default {
  markComplete,
  unmarkComplete,
  getHabitCompletions,
  getUserCompletions,
  setToken,
}
