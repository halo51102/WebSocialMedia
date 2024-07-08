import axios from "axios"

export const makeRequest = axios.create({
    baseURL: "http://192.168.1.189:8800/api/",
    withCredentials: true,
})