import React from 'react'
import { BsPerson } from "react-icons/bs"
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'

const ProfilePic = ({soul, src, size}) => {
    
    const apiContext = useContext(ApiContext)
    const [picture, setPicture] = useState()

    let eventUnSubs
    useEffect(() => {

        //if a source was provided then don't query for it
        if(!src){
            apiContext.businessLogic.subscribeProfilePic(
                soul,
                (picture) => {
                    URL.revokeObjectURL(picture)
                    setPicture(picture)
                },
                eventUnSubs,
                false
            )

            return () => {
                if (eventUnSubs) {
                    eventUnSubs.forEach(u => u.off())
                }
                URL.revokeObjectURL(picture)
            };
        } else {
            setPicture(src)
        }

    }, [src])


    return (
        <>
            {picture && <img className="m-1 circle-image" height={size || '50px'} width={size || '50px'} src={picture}/>}
            {!picture && <BsPerson style={{height:size || '50px',width:size || '50px'}}/>}
        </>
    )
}

export default ProfilePic
