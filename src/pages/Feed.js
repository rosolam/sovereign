import FeedHeader from '../components/FeedHeader'
import Posts from '../components/Posts'
import {useParams} from 'react-router-dom';

const ProfileFeed = () => {
    
    let { soul } = useParams();

    return (
        <>
        <FeedHeader soul={soul}/>
        <Posts soul={soul}/>
        </>
    )
}

export default ProfileFeed
