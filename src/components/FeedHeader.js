import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { Link } from "react-router-dom"
import missingProfileImage from '../media/missing-profile-picture.png'
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react'
import ApiContext from '../api/ApiContext'
import { BackArrow } from './BackArrow';
import NewPostModal from './NewPostModal'
import UpdateProfileModal from './UpdateProfileModal'
import FollowModal from './FollowModal'
import AddressModal from './AddressModal'

const FeedHeader = ({ soul }) => {

    const apiContext = useContext(ApiContext)
    const [profile, setProfile] = useState({ name: 'loading...', picture: '' })
    const [following, setFollowing] = useState({ unfollowed: true, trusted: false, mute: false })
    const [followModal, setFollowModal] = useState(false)
    const [myProfileModal, setMyProfileModal] = useState(false)
    const [postModal, setPostModal] = useState(false)
    const [addressModal, setAddressModal] = useState(false)
    const history = useHistory();

    let eventUnSubs = []
    const isMe = apiContext.businessLogic.isMine(soul)


    useEffect(() => {

        console.log('setting profile event handler', soul)
        apiContext.businessLogic.subscribeProfile(
            soul,
            setProfile,
            setFollowing,
            null,
            eventUnSubs
        )

        return () => {

            console.log('dropping profile event handler')
            if (eventUnSubs) {
                eventUnSubs.forEach(u => u.off())
            }

        };

    }, [])

    const onProfileClick = (e) => {
        e.preventDefault()
        alert('expand profile?')
    }

    return (
        <>
            <FollowModal show={followModal} onClose={() => { setFollowModal(false) }} />
            <UpdateProfileModal show={myProfileModal} onClose={() => { setMyProfileModal(false) }} />
            <NewPostModal show={postModal} onClose={() => { setPostModal(false) }} />
            <AddressModal show={addressModal} onClose={() => { setAddressModal(false) }} soul={soul} />

            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand href="#home">
                    <div className='d-flex'>
                        <BackArrow path='/Following' />
                        <div className="profile d-flex align-items-center" onClick={onProfileClick}>
                            <img className="m-2 circle-image" height="50" width="50" src={profile ? profile.picture : 'missing'} onError={(e) => { e.target.onerror = null; e.target.src = missingProfileImage }} />
                            <div className='m-1' style={{ fontWeight: 700, fontSize: '20px' }}>{profile.name}</div>
                        </div>
                    </div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto">
                        {isMe && <Nav.Link href="#" onClick={() => { setPostModal(true) }}>New Post</Nav.Link>}
                        {isMe && <Nav.Link href="#" onClick={() => { setMyProfileModal(true) }}> Update My Profile</Nav.Link>}
                        {!isMe && <Nav.Link href="#" >Trust</Nav.Link>}
                        {!isMe && <Nav.Link href="#" >Unfollow</Nav.Link>}
                        <Nav.Link href="#"  onClick={() => { setAddressModal(true) }}>Copy Address to Clipboard</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    )

}

export default FeedHeader
