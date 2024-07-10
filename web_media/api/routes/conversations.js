import express from 'express'
import { createConversation, getUserConversations, deleteConversation, getConversationMembers, deleteMember, getAllUsersConverSation } from '../controllers/conversations.js'
const router = express.Router()

router.post("/", createConversation)
router.get("/allmembersroom", getAllUsersConverSation)
router.get("/:userId", getUserConversations)
router.delete("/:id", deleteConversation)
router.get("/members/:conversationId", getConversationMembers)
router.delete('/:conversationId/:userId', deleteMember);

export default router