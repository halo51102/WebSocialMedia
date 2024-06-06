import express from 'express'
import { login, register, logout, otp} from '../controllers/auth.js'

const routes = express.Router()

routes.post("/login", login)
routes.post("/register", register)
routes.post("/logout", logout)
routes.post("/otp", otp)


export default routes