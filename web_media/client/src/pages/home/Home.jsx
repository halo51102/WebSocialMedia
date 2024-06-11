import Stories from "../../components/stories/Stories"
import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import "./home.scss"
import { useContext } from "react"
import { AuthContext } from "../../context/authContext"

const Home = ({socket, user}) => {
  const { currentUser } = useContext(AuthContext)
  console.log(currentUser)

  return (
    <div className="home">
      <Stories />
      <Share />
      <Posts userId={currentUser.id} socket={socket} user={user} whichPage={"home"}/>
    </div>
  )
}

export default Home