import axios from 'axios'
const baseUrl = '/v1/authentication/user'

const register = async (credentials) => {
    const response = await axios.post(baseUrl, credentials)
    return response.data.data
}

export default { register }