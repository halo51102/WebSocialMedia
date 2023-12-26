import express from 'express'
import { getStories, createStory, deleteStory, getStoriesOfUser } from '../controllers/story.js'
const router = express.Router()

router.get("/all", getStories)
router.get("/", getStoriesOfUser)
router.post("/", createStory)
router.delete("/:id", deleteStory)

export default router