import express from 'express'
import { getStoragePosts} from '../controllers/storage.js'
const routes = express.Router()

routes.get("/", getStoragePosts)


export default routes