import express from 'express'
import { addPost, getPosts, deletePost, getPostsInGroup, deletePostInGroup, getPostsInProfile, countPosts, getAPost, getAllPosts, updateReportStatus } from '../controllers/post.js'
const routes = express.Router()

routes.get("/", getPosts)
routes.get("/all", getAllPosts)
routes.get("/s/:postId", getAPost)
routes.get("/profile", getPostsInProfile)
routes.get("/count", countPosts)
routes.post("/", addPost)
routes.delete("/:id", deletePost)
routes.delete("/:id/:groupId", deletePostInGroup)
routes.get("/groups/:groupId", getPostsInGroup)
routes.put("/report/:postId", updateReportStatus)

export default routes