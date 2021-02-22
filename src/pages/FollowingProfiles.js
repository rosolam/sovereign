import { Link } from "react-router-dom"
import Header from '../components/Header'
import FollowUserModal from '../components/FollowUserModal'
import UpdateProfileModal from '../components/UpdateProfileModal'
import Profiles from '../components/Profiles'

const FollowingProfile = () => {

    return (
        <>
        <Header/>
        <FollowUserModal/>
        <UpdateProfileModal/>
        <Profiles/>
        </>
    )
}

export default FollowingProfile
