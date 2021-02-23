import missingProfileImage from '../media/missing-profile-picture.png'
import {Dropdown} from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'


const Profile = ({soul}) => {
   
    const apiContext = useContext(ApiContext)

    const [profile, setProfile] = useState({name:'loading...', picture:''})
    const [following, setFollowing] = useState({unfollowed: true, trusted: false, mute: false})
    const [lastPost, setLastPost] = useState()

    let eventUnSubs

    useEffect(() => {

        console.log('setting profile event handler')
        apiContext.businessLogic.subscribeProfile(
            soul,
            setProfile,
            setFollowing,
            setLastPost,
            eventUnSubs
        )
        
        return () => {

            console.log('dropping profile event handler')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
        
        };

    }, [])

    return (
        <div className="profile d-flex flex-column border">
            <div className="d-flex">
                <img className="m-1 rounded" height="50" width="50" src={profile ? profile.picture : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} />
                <div className="d-flex flex-column flex-grow-1">
                    <span>{profile.name}</span>
                    <span>{lastPost ? lastPost.text : ''}</span>
                </div>
            </div>
            <Dropdown>
                <Dropdown.Toggle className="btn-sm">action</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item>Open</Dropdown.Item>
                    <Dropdown.Item>Copy ID to Clipboard</Dropdown.Item>
                    <Dropdown.Item>Trust</Dropdown.Item>
                    <Dropdown.Item>Mute</Dropdown.Item>
                    <Dropdown.Item>Unfollow</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )


}

export default Profile