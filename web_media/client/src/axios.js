import axios from "axios"

export const makeRequest = axios.create({
    baseURL: `http://${process.env.REACT_APP_HOST}/api/`,
    withCredentials: true,
})