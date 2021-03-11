import {useState, useContext} from 'react'
import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import FollowUser from '../modals/FollowUser'
import CreatePost from '../modals/CreatePost'
import EditProfile from '../modals/EditProfile'
import ApiContext from '../api/ApiContext'
import {useHistory} from 'react-router-dom';
import UserAddress from '../modals/UserAddress'
import { Link} from "react-router-dom";

const FollowingHeader = () => {
  
  const apiContext = useContext(ApiContext)
  
  const [followModal, setFollowModal] = useState(false)
  const [myProfileModal, setMyProfileModal] = useState(false)
  const [postModal, setPostModal] = useState(false)
  const [addressModal, setAddressModal] = useState(false)
  const history = useHistory();

  function handleLogout(){
    apiContext.businessLogic.logout()
    history.push('/login');
  }

  return (
    <>
      
      <FollowUser show={followModal} onClose={() => {setFollowModal(false)}}/>
      <EditProfile show={myProfileModal} onClose={() => {setMyProfileModal(false)}}/>
      <CreatePost show={postModal} onClose={() => {setPostModal(false)}}/>
      <UserAddress show={addressModal} onClose={() => { setAddressModal(false) }} soul={apiContext.businessLogic.mySoul} />

      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#"><div className='d-flex flex-column justify-content-center' style={{height:'50px'}}>Sovereign</div></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#" onClick={() => {setPostModal(true)}}>New Post</Nav.Link>
            <Nav.Link href="#" onClick={() => {setFollowModal(true)}}>Follow Someone</Nav.Link>
            <Nav.Link href="#" onClick={() => { setAddressModal(true) }}>Share My Address</Nav.Link>
            <Nav.Link href="#" onClick={() => {setMyProfileModal(true)}}> Update My Profile</Nav.Link>
            <Nav.Link as={Link} to="/settings/basic">Settings</Nav.Link>
            <Nav.Link href="#" onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
    )
}

export default FollowingHeader

