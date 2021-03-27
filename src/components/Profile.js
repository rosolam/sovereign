import ProfilePic from './ProfilePic'
import {useHistory, useParams} from 'react-router-dom';
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'
import { BsPersonCheck as TrustedIcon} from "react-icons/bs"


const Profile = ({soul}) => {
   
    const apiContext = useContext(ApiContext)
    let { id } = useParams();
    const [profile, setProfile] = useState({name:'loading...'})
    const [following, setFollowing] = useState({trusted: false, mute: false})
    const [lastPost, setLastPost] = useState()
    const [timeElapsed, setTimeElapsed] = useState('')
    const history = useHistory();

    let eventUnSubs = []

    useEffect(() => {

        console.log('setting profile event handlers')
        apiContext.businessLogic.subscribeProfile(soul,setProfile, eventUnSubs, false)
        apiContext.businessLogic.subscribeFollowing(soul,setFollowing, eventUnSubs, false)
        apiContext.businessLogic.subscribeLastPost(soul, setLastPost, eventUnSubs, false)

        return () => {

            console.log('dropping profile event handlers')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
        
        };

    }, [])

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
        <div className="profile d-flex border-bottom" onClick={onProfileClick}>
            <ProfilePic soul={soul}/>
            <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex flex-fill">
                    <div style={{fontWeight:700, fontSize:'20px'}}>{profile.name}</div>
                    <div style={{marginLeft:'auto'}}><div className='mr-2'>{following.trusted && <TrustedIcon/>}</div></div>
                </div>
                <div className="d-flex flex-fill">
                    <div className='ellipsis' style={{width:225, fontWeight:700, fontSize:'12px'}}>{lastPost ? lastPost.text : 'no posts yet'}</div>
                    <div className='d-flex' style={{marginLeft:'auto'}}><div className='mr-2' style={{fontWeight:700, fontSize:'12px'}}>{timeElapsed}</div></div>
                </div>
            </div>
        </div>
    )


}

export default Profile