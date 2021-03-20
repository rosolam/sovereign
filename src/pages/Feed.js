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

const ProfileFeed = () => {
    
    let { soul } = useParams();
    const apiContext = useContext(ApiContext)
    const isMe = apiContext.businessLogic.isMine(soul)

    const headerNavs = () => {
        if(isMe){
            return (
                [
                    <ModalController modal={CreatePost} key="0"><Nav.Link>New Post</Nav.Link></ModalController>,
                    <ModalController modal={EditProfile} key="1"><Nav.Link>Update My Profile</Nav.Link></ModalController>,
                    <ModalController modal={UserAddress} modalProps={{soul:soul}} key="2"><Nav.Link>Copy Address to Clipboard</Nav.Link></ModalController>,
                ]
            ) 
        } else {
            return (
                [
                    <Nav.Link onClick={() => {apiContext.businessLogic.trustUser(soul,true)}} key="0">Trust</Nav.Link>,
                    <Nav.Link onClick={() => {apiContext.businessLogic.followUser(soul,false)}} key="1">Unfollow</Nav.Link>,
                    <ModalController modal={UserAddress} modalProps={{soul:soul}} key="2"><Nav.Link>Copy Address to Clipboard</Nav.Link></ModalController>,
                ]
            )
        }
    }

    return (
        <>
        <Header showBack={true} label={<ProfileName soul={soul}/>} subLabel="Feed" picture={<ProfilePic soul={soul}/>} navs={headerNavs()} />
        <Posts soul={soul}/>
        </>
    )
}

export default ProfileFeed
