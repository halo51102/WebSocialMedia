import express from 'express'
import { getLikes } from '../controllers/like.js'
const routes=express.Router()

routes.get("/",getLikes)


export default routes