import {useContext} from 'react'
import FollowingHeader from '../components/FollowingHeader'
import Profiles from '../components/Profiles'
import Profile from '../components/Profile'
import ApiContext from '../api/ApiContext'

const Following = () => {
    
    const apiContext = useContext(ApiContext)

    return (
        <>
        <FollowingHeader/>
        <Profile soul={apiContext.businessLogic.mySoul}/>
        <Profiles/>
        </>
    )
}

export default Following
