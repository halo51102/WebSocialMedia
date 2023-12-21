import express from 'express'
import { addMemberGroup, getGroup, getAllGroup, addGroup, deleteGroup,getMemberGroup, joinGroup,outGroup,updateInfoGroup,kichMember,getGroupJoinedIn ,getGroupNoJoin} from '../controllers/group.js'
const routes=express.Router()

routes.get("/myjoin",getGroupJoinedIn)
routes.get("/nojoin",getGroupNoJoin)
routes.get("/",getAllGroup)
routes.get("/:groupId",getGroup)
routes.post("/",addGroup)
routes.delete("/",deleteGroup)
routes.get("/:groupId/members",getMemberGroup)
routes.post("/:groupId/members",joinGroup)
routes.post("/:groupId/members/:userId",addMemberGroup)
routes.delete("/:groupId/members",outGroup)
routes.delete("/:groupId/members/:userId",kichMember)
routes.put("/",updateInfoGroup)



export default routes