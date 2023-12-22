import express from 'express'
import { addNotifications, getNotifications } from '../controllers/notifications.js'
const routes = express.Router()

routes.get("/", getNotifications)
routes.post("/", addNotifications)

export default routes