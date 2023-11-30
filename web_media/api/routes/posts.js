import express from 'express'
import { addPost,getPosts, deletePost,getPostsInGroup} from '../controllers/post.js'
const routes=express.Router()

routes.get("/",getPosts)
routes.post("/",addPost)
routes.delete("/:id",deletePost)
routes.get("/groups/:groupId",getPostsInGroup)

export default routes