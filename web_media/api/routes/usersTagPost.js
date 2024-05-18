import express from 'express'
import { getAllUserTagPost} from '../controllers/userTagPost.js'
const routes = express.Router()

routes.get("/", getAllUserTagPost)


export default routes