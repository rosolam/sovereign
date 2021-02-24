import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import { Link } from "react-router-dom"
import missingProfileImage from '../media/missing-profile-picture.png'
import {Dropdown} from 'react-bootstrap'
import {useHistory} from 'react-router-dom';
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'


const ProfileHeader = ({soul}) => {
   
    const apiContext = useContext(ApiContext)
    const [profile, setProfile] = useState({name:'loading...', picture:''})
    const [following, setFollowing] = useState({unfollowed: true, trusted: false, mute: false})
    const history = useHistory();

    let eventUnSubs = []

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
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
        
        };

    }, [])

    const onProfileClick = (e) => { 
        e.preventDefault()
        alert('expand profile?')
    }

    return (
        <div className="profile d-flex align-items-center" onClick={onProfileClick}>
            <img className="m-2 circle-image" height="50" width="50" src={profile ? profile.picture : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} />
            <div className='m-1' style={{fontWeight:700, fontSize:'20px'}}>{profile.name}</div>
        </div>
    )


}

export default ProfileHeader
