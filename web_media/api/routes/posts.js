import express from 'express'
import { addPost, deletePost, getPosts } from '../controllers/post.js'
const routes = express.Router()

routes.get("/", getPosts)
routes.post("/", addPost)
routes.delete("/:id", deletePost)

export default routes