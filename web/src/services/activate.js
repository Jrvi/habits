import axios from "axios"
const baseUrl = '/v1/users/activate'

const activate = async (token) => {
    const response = await axios.put(`${baseUrl}/${token}`)
    return response.data.data
}

export default { activate }