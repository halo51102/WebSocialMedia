import express from 'express'
import { add, getAllUserTagPost } from '../controllers/userTagPost.js'
const routes = express.Router()

routes.get("/", getAllUserTagPost)
routes.post("/", add)

export default routes