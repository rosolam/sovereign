import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Profile from './Profile'


const Profiles = () => {

    const apiContext = useContext(ApiContext)
    const [profiles, setProfiles] = useState([])
    let eventUnSubs

    useEffect(() => {

        console.log('setting profiles event handler')
        apiContext.businessLogic.subscribeProfiles(setProfiles, eventUnSubs)
  
        return () => {

            console.log('dropping profiles event handler')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
           
        };

    }, []);

    return (
        <div className="scrolling-wrapper">
            {!profiles.length && 
                <div className='d-flex h-100 justify-content-center align-items-center'><div style={{'fontWeight':700, 'fontSize':'10px'}}>you are not following anyone yet</div></div>
            }
            <div className="scrolling-content">
                {profiles.map((profile) => (
                    <Profile soul={profile.key} key={profile.key} />
                ))}
            </div>
        </div>
    );

}

export default Profiles