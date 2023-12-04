import express from 'express'
import { getUser } from '../controllers/user.js'
const router=express.Router()

router.get("/find/:userId",)
router.get("/", getUser)

export default router