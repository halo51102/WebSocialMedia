import express from 'express'
import { getUser, updateUser, getAllUsers, getUserByPostId } from '../controllers/user.js'
const router = express.Router()

router.get("/find/:userId", getUser)
router.get("/", getAllUsers)
router.put("/", updateUser)
router.get("/findByPost/:postId", getUserByPostId)

export default router