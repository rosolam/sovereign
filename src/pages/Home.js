import { Link } from "react-router-dom"
import Header from '../components/Header'
import FollowUserModal from '../components/FollowUserModal'
import NewPostModal from '../components/NewPostModal'
import Profiles from '../components/Profiles'
import Posts from '../components/Posts'

const Home = (props) => {

    return (
    
        <div>
            <Link to="/test">test</Link>
            <Header/>
            <FollowUserModal/>
            <NewPostModal/>
            <Profiles/>
            <Posts/>
        </div>
    )
}

export default Home
