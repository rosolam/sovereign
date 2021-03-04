import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { Link } from "react-router-dom"
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react'
import ApiContext from '../api/ApiContext'
import BackArrow from './BackArrow';
import NewPostModal from './NewPostModal'
import UpdateProfileModal from './UpdateProfileModal'
import FollowModal from './FollowModal'
import AddressModal from './AddressModal'
import ProfilePic from './ProfilePic'

const FeedHeader = ({ soul }) => {

    const apiContext = useContext(ApiContext)
    const [profile, setProfile] = useState({ name: 'loading...', picture: '' })
    const [profilePic, setProfilePic] = useState()
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
            setProfilePic,
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

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        URL.revokeObjectURL(profilePic);
    }, [profilePic]);
    
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
                <Navbar.Brand href="#" className='d-flex m-0 mr-1' >
                    <BackArrow path='/Following' />
                    <div className="d-flex" onClick={onProfileClick}>
                        <ProfilePic src={profilePic}/>
                        <div className='m-1 d-flex flex-wrap align-content-center' style={{ fontWeight: 700, width:'130px', fontSize: '15px', whiteSpace:'normal', overflowWrap:'anywhere'}}>{profile.name}</div>
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
