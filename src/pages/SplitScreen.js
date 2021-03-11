import { Link } from "react-router-dom"
import Header from '../components/Header'
import FollowUserModal from '../components/FollowUserModal'
import CreatePost from '../modals/CreatePost'
import Profiles from '../components/Profiles'
import Posts from '../components/Posts'
import EditProfile from "../modals/EditProfile"

const SplitScreen = () => {

    return (
        <>
        <Header/>
        <div className='d-flex h-100 w-100'>
            <div className='d-flex flex-column h-100 split-left'>
                <FollowUserModal/>
                <EditProfile/>
                <Profiles/>
            </div>
            <div className='d-flex flex-column h-100 flex-grow-1 split-center'>
                <CreatePost/>
                <Posts/>
            </div>
        </div>
        </>
    )
}

export default SplitScreen