import axios from "axios"

const API_BASE =
  import.meta.env.MODE === "development"
    ? ""
    : "https://habits-bitter-bird-9050.fly.dev"

const apiClient = axios.create({
  baseURL: API_BASE,
})

export default apiClient
