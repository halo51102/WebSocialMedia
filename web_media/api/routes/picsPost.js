import express from 'express'
import { getAllPicOfPost} from '../controllers/picPost.js'
const routes = express.Router()

routes.get("/", getAllPicOfPost)


export default routes