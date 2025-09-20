import axios from 'axios'
const baseUrl = '/v1/habits'

let token = null

const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const create = async (newObject) => {
    const config = {
        headers: { Authorization: token },
    }
    const response = await axios.post(baseUrl, newObject, config)
    return response.data.data
}

const update = async (id, updatedObject) => {
    const config = {
        headers: { Authorization: token },
    }
    const response = await axios.patch(`${baseUrl}/${id}`, updatedObject, config)
    return response.data.data
}

const remove = async (id) => {
    const config = {
        headers: { Authorization: token },
    }
    const response = await axios.delete(`${baseUrl}/${id}`, config)
    return response.data.data
}

export default { create, update, remove, setToken }