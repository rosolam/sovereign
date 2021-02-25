import {useState} from 'react'
import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import FollowModal from './FollowModal'
import UpdateProfileModal from './UpdateProfileModal'

const FollowingHeader = () => {
    
  const [followModal, setFollowModal] = useState(false)
  const [myProfileModal, setMyProfileModal] = useState(false)

  return (
    <>
      
      {followModal && <FollowModal onClose={() => {setFollowModal(false)}}/>}
      <UpdateProfileModal show={myProfileModal} onClose={() => {setMyProfileModal(false)}}/>

      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">Sovereign</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#">Post</Nav.Link>
            <Nav.Link href="#" onClick={() => {setFollowModal(true)}}>Follow </Nav.Link>
            <Nav.Link href="#" >My Address</Nav.Link>
            <Nav.Link href="#" onClick={() => {setMyProfileModal(true)}}> Update My Profile</Nav.Link>
            <NavDropdown title="Settings" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#">Setting 1</NavDropdown.Item>
              <NavDropdown.Item href="#">Setting 2</NavDropdown.Item>
              <NavDropdown.Item href="#">Setting 3</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
    )
}

export default FollowingHeader

