import ApiContext from './ApiContext'
import {useContext } from 'react'

export const CreatePost = (post) => {

    const apiContext = useContext(ApiContext)

    //create new post
    const created = new Date().getTime()
    apiContext.gunAppRoot.get('posts').set({
        text: post.text,
        created: created,
        modified: created
    })

}

export const FollowUser = (follow) => {

    const apiContext = useContext(ApiContext)

    //get user referecne
    const userRef = this.gun.get(follow.soul)

    //follow user
    apiContext.gunAppRoot.get('following').get(follow.soul).put({ trusted: false, mute: false }).get('user').put(userRef);

}

export const UpdateProfile = (profile) => {

    const apiContext = useContext(ApiContext)

    console.log("handleupdateprofile")

    //get user referecne
    //const userRef = this.gun.get(follow.soul)

    //follow user
    //this.gunAppRoot.get('following').get(follow.soul).put({trusted: false,mute: false}).get('user').put(userRef);

}

export const GetProfile = (soul, cb) => {

    const apiContext = useContext(ApiContext)

    if(soul){
        //return specified user's profile
        apiContext.gun.get(soul).get('sovereign').get('profile').once(cb)
    }else{
        //return this user's profile
        apiContext.gunAppRoot.get('profile').once(cb)
    }

}