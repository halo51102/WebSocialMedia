import express from 'express'
import { getLikes, addLikes, deleteLikes } from '../controllers/like.js'
const routes=express.Router()

routes.get("/",getLikes)
routes.post("/",addLikes)
routes.delete("/",deleteLikes)


export default routes