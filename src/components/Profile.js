import missingProfileImage from '../media/profile.png'
import {Dropdown} from 'react-bootstrap'
import {useHistory, useParams} from 'react-router-dom';
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'


const Profile = ({soul}) => {
   
    const apiContext = useContext(ApiContext)
    let { id } = useParams();
    const [profile, setProfile] = useState({name:'loading...', picture:''})
    const [profilePic, setProfilePic] = useState()
    const [following, setFollowing] = useState({unfollowed: true, trusted: false, mute: false})
    const [lastPost, setLastPost] = useState()
    const [timeElapsed, setTimeElapsed] = useState('')
    const history = useHistory();

    let eventUnSubs = []

    useEffect(() => {

        console.log('setting profile event handler')
        apiContext.businessLogic.subscribeProfile(
            soul,
            setProfile,
            setProfilePic,
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

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        URL.revokeObjectURL(profilePic);
    }, [profilePic]);

    let timeElapsedUnSub = []

    useEffect(() => {
        
        if(!lastPost){return}

        console.log('setting last post elapsed time event handler')
        apiContext.businessLogic.subscribeTimeElapsed(lastPost.created, setTimeElapsed, timeElapsedUnSub)

        return () => {
            console.log('dropping last post elapsed time event handler')
            if(timeElapsedUnSub){
                timeElapsedUnSub.forEach(u => u.off())
            }
        }

    }, [lastPost])

    const onProfileClick = (e) => { 
        e.preventDefault()
        history.push('/Feed/' + soul);
    }

    return (
        <div className="profile d-flex" onClick={onProfileClick}>
            <img className="m-1 circle-image" height="50" width="50" src={profilePic ? profilePic : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} />
            <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex flex-fill">
                    <div style={{fontWeight:700, fontSize:'20px'}}>{profile.name}</div>
                    <div style={{marginLeft:'auto'}}><div className='mr-2'></div></div>
                </div>
                <div className="d-flex flex-fill">
                    <div className='ellipsis' style={{width:225, fontWeight:700, fontSize:'12px'}}>{lastPost ? lastPost.text : ''}</div>
                    <div className='d-flex' style={{marginLeft:'auto'}}><div className='mr-2' style={{fontWeight:700, fontSize:'12px'}}>{timeElapsed}</div></div>
                </div>
            </div>
        </div>
    )


}

export default Profile