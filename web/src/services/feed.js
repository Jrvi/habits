import axios from "axios"
const baseUrl = '/v1/users/feed'

let token = null

const setToken = (newToken) => {
    token = `Bearer ${newToken}`
}

const getFeed = async () => {
    const config = {
        headers: { Authorization: token },
    }
    const response = await axios.get(baseUrl, config)
    return response.data.data
}

export default { getFeed, setToken }