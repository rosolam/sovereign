import missingProfileImage from '../media/missing-profile-picture.png'
import loadingImageAnimation from '../media/loading-attachment.gif'
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

    const hideLoadingAnimation = (key) => {

        setAttachments( (prevState) => {

            //get item
            const existingItem = prevState.find((p) => p.key == key)
            const updatedItem = {...existingItem}
            updatedItem.isLoaded = true
            return ([...prevState.filter(p => p.key !== key),updatedItem].sort((a, b) => {  return b['key'] - a['key'] }))

        })

    }

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
                <>
                    {!attachments[0].isLoaded && <img className="img-fluid mx-auto d-block max-height-75" src={loadingImageAnimation}/>}
                    <img src={attachments[0].url} className="img-fluid mx-auto d-block max-height-75" onLoad={() => { 
                        if(!attachments[0].isLoaded){hideLoadingAnimation(attachments[0].key)}
                    }} />
                </>
            );

        } else {

            //multiple pictures
            return (
                <Carousel className="bg-dark">
                    {attachments.map((picture, index) => (
                        <Carousel.Item key={index}>
                            {!attachments[0].isLoaded && <img className="img-fluid mx-auto d-block max-height-75" src={loadingImageAnimation}/>}
                            <img src={picture.url} className="img-fluid mx-auto d-block max-height-75" onLoad={() => { 
                                if(!attachments[0].isLoaded){hideLoadingAnimation(picture.key)}
                            }} />
                        </Carousel.Item>
                    ))}
                </Carousel>
            );
        }

    }

    return (

            <div className="border m-3 d-flex flex-column bg-light rounded-corners">
        
                {!soul && <ProfileHeader/>}
        
                <div className="d-flex m-1">
                    <div className="flex-grow-1" style={{'maxHeight':'50vh', overflow: 'auto', overflowWrap: 'anywhere', 'fontWeight':700, 'fontSize':'15px'}}>{postRoot.text}</div>
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
