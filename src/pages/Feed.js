import ProfileHeader from '../components/ProfileHeader'
import Posts from '../components/Posts'
import {useParams} from 'react-router-dom';
import { BackArrow } from '../components/BackArrow';

const ProfileFeed = () => {
    
    let { soul } = useParams();

    return (
        <>
        <div className="d-flex border">
            <BackArrow path='/Following'/>
            <ProfileHeader soul={soul}/>
        </div>
        <Posts soul={soul}/>
        </>
    )
}

export default ProfileFeed
