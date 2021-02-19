import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Profile from './Profile'

const Profiles = () => {

    const apiContext = useContext(ApiContext)
    const [profiles, setProfiles] = useState([])

    const getNewProfileState = (prevState, value, key) => {

        //check to see if profile exists already
        const existingProfileIndex = prevState.findIndex(p => p.key === key)
        console.log('exsting index', existingProfileIndex)
        if (existingProfileIndex == -1) {

            //new, add profile item to state
            console.log('adding profile')
            const newProfile = value
            newProfile.key = key

            //sort the new profile into the array
            return [...prevState, newProfile].sort((a, b) => { return b.created - a.created })

        } else {

            //yes, a profile with this id exists...
            //console.log('existing profile')

            //is this an update to delete it?
            if (!value) {

                //yes, delete it
                console.log('deleting profile')
                return prevState.filter(p => p.key !== key)

            } else {

                //No, has it changed?
                const existingProfile = prevState[existingProfileIndex]
                if (value.modified > existingProfile.modified) {

                    //yes, update it
                    console.log('updating profile')
                    const updatedProfile = value
                    updatedProfile.key = key
                    return ([...prevState.filter(p => p.key !== key),updatedProfile].sort((a, b) => { return b.created - a.created }))

                } else {

                    //dupe, ignore this event
                    console.log('ignoring profile')
                    return prevState

                }
            }

        }

    }

    const handleProfileUpdate = (value, key, _msg, _ev) => {

        console.log('profile update event', value, key)
        setProfiles(prevState => getNewProfileState(prevState, value, key))

    }

    useEffect(() => {

        console.log('setting profile event handler')

        //handle updates to the profiles of the users I follow
        apiContext.gunAppRoot.get('following').map().get('user').get('sovereign').get('profile').on((value, key, _msg, _ev) => handleProfileUpdate(value, key, _msg, _ev))

        return () => {

            console.log('dropping profile event handler')
            apiContext.gunAppRoot.get('following').map().get('user').get('sovereign').get('profile').off()

        };

    }, []);

    return (
        <div>
            <div>{apiContext.test}</div>
            {profiles.map((profile) => (
                <Profile profile={profile} key={profile.key} />
            ))}
        </div>
    );

}

export default Profiles