import express from 'express'
import { addPost, getPosts, deletePost, getPostsInGroup, deletePostInGroup, getPostsInProfile } from '../controllers/post.js'
const routes = express.Router()

routes.get("/", getPosts)
routes.get("/profile", getPostsInProfile)
routes.post("/", addPost)
routes.delete("/:id", deletePost)
routes.delete("/:id/:groupId", deletePostInGroup)
routes.get("/groups/:groupId", getPostsInGroup)

export default routes