import {useContext} from 'react'
import Profiles from '../components/Profiles'
import Profile from '../components/Profile'
import ApiContext from '../api/ApiContext'
import FollowUser from '../modals/FollowUser'
import CreatePost from '../modals/CreatePost'
import EditProfile from '../modals/EditProfile'
import UserAddress from '../modals/UserAddress'
import Header from '../components/Header'
import { Nav } from 'react-bootstrap'
import ModalController from '../modals/ModalController'
import { Link, useHistory } from 'react-router-dom'

const Following = () => {
    
    const apiContext = useContext(ApiContext)
    const history = useHistory();

    function handleLogout(){
        apiContext.businessLogic.logout()
        history.push('/login');
      }

    const headerNavs = [
        <ModalController modal={CreatePost}><Nav.Link>New Post</Nav.Link></ModalController>,
        <ModalController modal={FollowUser}><Nav.Link>Follow Someone</Nav.Link></ModalController>,
        <ModalController modal={UserAddress} modalProps={{soul:apiContext.businessLogic.mySoul}}><Nav.Link>Share My Address</Nav.Link></ModalController>,
        <ModalController modal={EditProfile}><Nav.Link>Update My Profile</Nav.Link></ModalController>,
        <Nav.Link as={Link} to="/settings/basic">Settings</Nav.Link>,
        <Nav.Link href="#" onClick={handleLogout}>Logout</Nav.Link>
    ]

    return (
        <>
        <Header label="Following" navs={headerNavs} />
        <Profile soul={apiContext.businessLogic.mySoul}/>
        <Profiles/>
        </>
    )
}

export default Following
