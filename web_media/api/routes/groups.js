import express from 'express'
import { getGroup, getAllGroup, addGroup, deleteGroup,getMemberGroup, joinGroup,outGroup } from '../controllers/group.js'
const routes=express.Router()

routes.get("/",getAllGroup)
routes.get("/:groupId",getGroup)
routes.post("/",addGroup)
routes.delete("/",deleteGroup)
routes.get("/members",getMemberGroup)
routes.post("/members",joinGroup)
routes.delete("/members",outGroup)


export default routes