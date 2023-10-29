import express from 'express'
import { getComments,addComment } from '../controllers/comment.js'
const routes=express.Router()

routes.get("/",getComments)
routes.post("/",addComment)

export default routes