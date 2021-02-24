import {Navbar, Nav, NavDropdown} from 'react-bootstrap'

const FollowingHeader = () => {
    
  return (
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">Sovereign</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link >Post</Nav.Link>
            <Nav.Link >Follow </Nav.Link>
            <Nav.Link >My Address</Nav.Link>
            <Nav.Link> Update My Profile</Nav.Link>
            <NavDropdown title="Settings" id="collasible-nav-dropdown">
              <NavDropdown.Item>Setting 1</NavDropdown.Item>
              <NavDropdown.Item>Setting 2</NavDropdown.Item>
              <NavDropdown.Item>Setting 3</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link >Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
}

export default FollowingHeader

