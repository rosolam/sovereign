import {Navbar, Nav} from 'react-bootstrap'
import BackArrow from './BackArrow'

const Header = ({back,label, navs}) => {
    return (
        <Navbar sticky="top" collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#" className='d-flex m-0 mr-1 align-items-center' >
            {back && <BackArrow path={back} />}
            <div className="ml-2">{label}</div>
        </Navbar.Brand>
        {navs && 
            <>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto">
                        {navs}
                    </Nav>
                </Navbar.Collapse>
            </>
        }
    </Navbar>
    )
}
export default Header
