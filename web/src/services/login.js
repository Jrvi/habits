import axios from 'axios'
const baseUrl = '/v1/authentication/token'


const login = async (credentials) => {
    const response = await axios.post(baseUrl, credentials)
    return response.data.data
}

export default { login }