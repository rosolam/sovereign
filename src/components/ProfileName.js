import React from 'react'
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'

const ProfileName = ({soul, size, userName}) => {
    
    const apiContext = useContext(ApiContext)
    const [name, setName] = useState(userName)

    let eventUnSubs
    useEffect(() => {

        //don't look it up if provided
        if(userName){return}

        apiContext.businessLogic.subscribeProfile(
            soul,
            (profile) => {
                setName(profile.name)
            },
            eventUnSubs,
            false
        )

        return () => {
            if (eventUnSubs) {
                eventUnSubs.forEach(u => u.off())
            }
        };

    }, [])


    return (
        <>
            {name && <div className='d-flex flex-wrap align-content-center' style={{ fontWeight: 700, width:'130px', fontSize: '15px', whiteSpace:'normal', overflowWrap:'anywhere'}}>{name}</div>}
        </>
    )
}

export default ProfileName
