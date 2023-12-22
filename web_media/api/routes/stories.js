import express from 'express'
import { getStories, createStory, deleteStory, getStoryOfUser } from '../controllers/story.js'
const router = express.Router()

router.get("/all", getStories)
router.get("/", getStoryOfUser)
router.post("/", createStory)
router.delete("/:id", deleteStory)

export default router