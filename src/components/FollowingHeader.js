import {useState, useContext} from 'react'
import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import FollowModal from './FollowModal'
import NewPostModal from './NewPostModal'
import UpdateProfileModal from './UpdateProfileModal'
import ApiContext from '../api/ApiContext'
import {useHistory} from 'react-router-dom';
import AddressModal from './AddressModal'

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
      
      <FollowModal show={followModal} onClose={() => {setFollowModal(false)}}/>
      <UpdateProfileModal show={myProfileModal} onClose={() => {setMyProfileModal(false)}}/>
      <NewPostModal show={postModal} onClose={() => {setPostModal(false)}}/>
      <AddressModal show={addressModal} onClose={() => { setAddressModal(false) }} soul={apiContext.businessLogic.mySoul} />

      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home"><div className='d-flex flex-column justify-content-center' style={{height:'50px'}}>Sovereign</div></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#" onClick={() => {setPostModal(true)}}>New Post</Nav.Link>
            <Nav.Link href="#" onClick={() => {setFollowModal(true)}}>Follow Someone</Nav.Link>
            <Nav.Link href="#"  onClick={() => { setAddressModal(true) }}>Share My Address</Nav.Link>
            <Nav.Link href="#" onClick={() => {setMyProfileModal(true)}}> Update My Profile</Nav.Link>
            <NavDropdown title="Settings" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#">Setting 1</NavDropdown.Item>
              <NavDropdown.Item href="#">Setting 2</NavDropdown.Item>
              <NavDropdown.Item href="#">Setting 3</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#" onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
    )
}

export default FollowingHeader

