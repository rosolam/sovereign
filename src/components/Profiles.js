import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Profile from './Profile'


const Profiles = () => {

    const apiContext = useContext(ApiContext)
    const [profiles, setProfiles] = useState([])
    let profilesUnSub

    useEffect(() => {

        console.log('setting profile event handler')
        apiContext.businessLogic.subscribeProfiles(setProfiles, profilesUnSub)
  
        return () => {

            console.log('dropping profile event handler', profilesUnSub)
            if(profilesUnSub){profilesUnSub.off()}
           
        };

    }, []);

    return (
        <div className="scrolling-wrapper">
            <div className="scrolling-content">
                {profiles.map((profile) => (
                    <Profile soul={profile['_']['#']} profile={profile} key={profile.key} />
                ))}
            </div>
        </div>
    );

}

export default Profiles