import {Navbar, Nav} from 'react-bootstrap'
import BackArrow from './BackArrow'

const Header = ({showBack, backPath, label, subLabel, navs, picture, modals}) => {
    return (
        <>
            {modals}
            <Navbar sticky="top" collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand className='d-flex m-0 mr-1 align-items-center' >
                    {showBack && <BackArrow path={backPath} />}
                    {picture}
                    <div className="ml-2 d-flex flex-column"><div>{label}</div><div className='small'>{subLabel}</div></div>
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
        </>
    )
}
export default Header
