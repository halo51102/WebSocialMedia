import express from 'express'
import { getUser, updateUser, getAllUsers, getUserByPostId,changePasswordUser, countUsers, deleteUser } from '../controllers/user.js'
const router = express.Router()

router.get("/find/:userId", getUser)
router.get("/", getAllUsers)
router.get("/count", countUsers)
router.put("/", updateUser)
router.get("/findByPost/:postId", getUserByPostId)
router.put("/changePassword",changePasswordUser)
router.delete("/:id",deleteUser)

export default router