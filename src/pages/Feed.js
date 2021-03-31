import { useState, useEffect, useContext} from 'react'
import Header from '../components/Header'
import Posts from '../components/Posts'
import {useParams} from 'react-router-dom';
import ProfilePic from '../components/ProfilePic';
import {Nav} from 'react-bootstrap'
import ProfileName from '../components/ProfileName';
import ApiContext from '../api/ApiContext'
import CreatePost from '../modals/CreatePost'
import EditProfile from '../modals/EditProfile'
import UserAddress from '../modals/UserAddress'
import ModalController from '../modals/ModalController';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {Button} from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'

const ProfileFeed = () => {
    
    let { soul } = useParams();
    const apiContext = useContext(ApiContext)
    const [following, setFollowing] = useState({loading: true})
    const [enableFollowPrompt, setEnableFollowPrompt] = useState(true)
    const isMe = apiContext.businessLogic.isMine(soul)

    let eventUnSubs = []

    useEffect(() => {

        console.log('setting profile event handlers')
        apiContext.businessLogic.subscribeFollowing(soul,setFollowing, eventUnSubs, false)

        return () => {

            console.log('dropping profile event handlers')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
        
        };

    }, [])

    //prompt to follow
    useEffect(() => {

        //check that we have updated the following state but we are not following
        if(following && !following.loading && !following.key && enableFollowPrompt){

            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                      <div className='border p-3 rounded' style={{maxWidth:'75vw'}}>
                        <div>Would you like to start following this user?</div>
                        <hr/>
                        <div className='d-flex justify-content-between'>
                            <Button className='mr-2' onClick={onClose}>Maybe Later</Button>
                            <Button onClick={() => {apiContext.businessLogic.followUser(soul,true);onClose();}}>Yes!</Button>
                        </div>
                      </div>
                    );
                },
                closeOnEscape: true,
                closeOnClickOutside: true
            })

            //ensure we dont get this prompt again
            setEnableFollowPrompt(false)

        }

    }, [following])

    const headerNavs = () => {

        const headerNavItems = []

        if(isMe){
            
            headerNavItems.push(
                [
                    <ModalController modal={CreatePost} key="00"><Nav.Link href="#" >New Post</Nav.Link></ModalController>,
                    <ModalController modal={EditProfile} key="01"><Nav.Link href="#" >Update My Profile</Nav.Link></ModalController>,
                ]
            ) 

        } else {
           
            if(following && following.key && !following.trusted){ headerNavItems.push(<Nav.Link href="#" onClick={() => {apiContext.businessLogic.trustUser(soul,true)}} key="10">Trust</Nav.Link>) }
            if(following && following.key && following.trusted){ headerNavItems.push(<Nav.Link href="#" onClick={() => {apiContext.businessLogic.trustUser(soul,false)}} key="11">UnTrust</Nav.Link>) }
            if(!following || !following.key){ headerNavItems.push(<Nav.Link href="#" onClick={() => {apiContext.businessLogic.followUser(soul,true)}} key="12">Follow</Nav.Link>) }
            if(following && following.key){ headerNavItems.push(<Nav.Link as={Link} to="/following" onClick={() => {setEnableFollowPrompt(false); apiContext.businessLogic.followUser(soul,false)}} key="13">UnFollow</Nav.Link>) }
        }
        
        headerNavItems.push(<ModalController modal={UserAddress} modalProps={{soul:soul}} key="24"><Nav.Link href="#" >Copy Address to Clipboard</Nav.Link></ModalController>)

        return headerNavItems

    }

    return (
        <>
        <Header showBack={true} label={<ProfileName soul={soul}/>} subLabel="Feed" picture={<ProfilePic soul={soul}/>} navs={headerNavs()} />
        <Posts soul={soul}/>
        </>
    )
}

export default ProfileFeed
