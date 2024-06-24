import express from 'express'
import { login, register, logout, verifyEmail, sendEmail, authorize } from '../controllers/auth.js'

const routes = express.Router()

routes.post("/login", login)
routes.post("/register", register)
routes.post("/logout", logout)
routes.post("/verify-email", verifyEmail)
routes.post("/send-verify-email", sendEmail)
routes.post("/authorize", authorize)

export default routes