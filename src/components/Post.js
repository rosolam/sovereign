import missingProfileImage from '../media/missing-profile-picture.png'
import { Dropdown, Carousel } from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'

const Post = ({soul}) => {
    
    const apiContext = useContext(ApiContext)

    const [postRoot, setPostRoot] = useState({text:'loading...'})
    const [attachments, setAttachments] = useState([])
    const [profile, setProfile] = useState({name:'loading...', picture:null})

    let eventUnSubs

    useEffect(() => {

        console.log('setting post event handler')
        apiContext.businessLogic.subscribePost(
            soul,
            setPostRoot,
            setAttachments, 
            setProfile
        )
        
        return () => {

            console.log('dropping post event handler')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
        
        };

    }, [])

    function ProfileHeader(){
        return (
            <div className="d-flex">
                <div><img className="m-1 rounded-corners" height="40" width="40" src={profile ? profile.picture : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} /></div>
                <div className="align-self-center" style={{'fontWeight':700, 'fontSize':'20px'}}>{profile ? profile.name : 'loading...'}</div>
            </div>
        );
    }

    function ImageSpot(){

        if(!attachments.length){
            //no images
            return(null);
        }

        if(attachments.length == 1){

            //single picture
            return (
                <img src={attachments[0].address} className="img-fluid mx-auto d-block max-height-75"/>
            );

        } else {

            //multiple pictures
            return (
                <Carousel className="bg-dark">
                    {attachments.map((picture, index) => (
                        <Carousel.Item key={index}>
                            <img src={picture.address} className="img-fluid d-block mx-auto max-height-75" />
                        </Carousel.Item>
                    ))}
                </Carousel>
            );
        }

    }

    return (

            <div className="border post m-3 d-flex flex-column justify-content-start bg-light rounded-corners">
        
                {!soul && <ProfileHeader/>}
        
                <div className="d-flex m-1">
                    <div className="flex-grow-1" style={{'maxHeight':'50vh', overflow: 'auto','fontWeight':700, 'fontSize':'15px'}}>{postRoot.text}</div>
                </div>

                <ImageSpot/>

                <div className="d-flex m-1">
                    <div style={{'fontWeight':700, 'fontSize':'10px'}}>{Date(postRoot.created)}</div>
                    <div className="flex-grow-1"></div>
                    <div>
                        <Dropdown>
                            <Dropdown.Toggle className="btn-sm">action</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Make Private</Dropdown.Item>
                                {apiContext.businessLogic.isMine(soul) && <Dropdown.Item onClick={() => apiContext.businessLogic.deletePost(soul)}>Delete</Dropdown.Item>}
                                <Dropdown.Item>Share</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
    )
}

export default Post
