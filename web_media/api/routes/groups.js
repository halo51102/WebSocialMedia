import express from 'express'
import { getGroup, getAllGroup, addGroup, deleteGroup,getMemberGroup, joinGroup,outGroup } from '../controllers/group.js'
const routes=express.Router()

routes.get("/",getAllGroup)
routes.get("/:groupId",getGroup)
routes.post("/",addGroup)
routes.delete("/",deleteGroup)
routes.get("/:groupId/members",getMemberGroup)
routes.post("/:groupId/members",joinGroup)
routes.delete("/:groupId/members",outGroup)


export default routes