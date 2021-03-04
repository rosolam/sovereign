import ProfilePic from './ProfilePic'
import { Dropdown, Carousel } from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import LinkPreview from './LinkPreview'
import ApiContext from '../api/ApiContext'

const Post = ({soul}) => {
    
    const apiContext = useContext(ApiContext)

    const [postRoot, setPostRoot] = useState({text:'loading...'})
    const [attachments, setAttachments] = useState([])
    const [profile, setProfile] = useState({name:'loading...', picture:null})

    let eventUnSubs

    const revokeObjectURLs = () => {
        // Make sure to revoke the data uris to avoid memory leaks
        attachments.forEach(attachment => {
            if(attachment.type == 'image'){
                URL.revokeObjectURL(attachment.url)
            }
        })
    }

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
            return revokeObjectURLs();
        
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
                <div><ProfilePic src={profile.picture} size={40}/></div>
                <div className="align-self-center" style={{'fontWeight':700, 'fontSize':'20px'}}>{profile ? profile.name : 'loading...'}</div>
            </div>
        );
    }

    function ImageSpot(){

        if(attachments.length){

            return (
                <Carousel className="bg-dark" indicators={attachments.length > 1 ? true : false} controls={attachments.length > 1 ? true : false}>
                {attachments.map((attachment, index) => (
                    <Carousel.Item key={index}>
                        <div style={{minHeight:'275px'}} className="d-flex p-2 justify-content-center align-items-center">
                            {attachment.type == 'image' && <img src={attachment.url} className="img-fluid max-height-75 mx-auto d-block" />}
                            {attachment.type == 'url' && <div style={{minHeight:'125px'}} ><LinkPreview previewUrl={attachment.url}/></div>}
                            {attachment.type == 'file' && <div style={{minHeight:'125px'}} >todo: file attachment component</div>}
                        </div>
                    </Carousel.Item>
                ))}
                </Carousel>
            );

        } else return(<></>)

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
