import express from 'express'
import { getStoragePosts, addStoragePosts, removeStoragePosts } from '../controllers/storage.js'
const routes = express.Router()


routes.post("/add", addStoragePosts)

routes.delete("/remove", removeStoragePosts)
routes.get("/", getStoragePosts)


export default routes