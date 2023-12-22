import express from 'express'
import { getRelationship, addRelationship, deleteRelationship, suggestFollow, getFollowEd } from '../controllers/relationship.js'
const routes = express.Router()

routes.get("/suggestFollow", suggestFollow)
routes.get("/ed", getFollowEd)
routes.get("/", getRelationship)
routes.post("/", addRelationship)
routes.delete("/", deleteRelationship)


export default routes