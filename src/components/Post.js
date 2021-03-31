import ProfilePic from './ProfilePic'
import { Dropdown, Carousel, Spinner, Button, Badge } from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import LinkPreview from './LinkPreview'
import ApiContext from '../api/ApiContext'
import ModalController from '../modals/ModalController'
import Comments from '../modals/Comments'
import { BsChatDots as CommentIcon } from "react-icons/bs"
import { BiShareAlt as ShareIcon } from "react-icons/bi"
import { AiOutlineEdit as ManageIcon } from "react-icons/ai"
import CreatePost from '../modals/CreatePost'

const Post = ({soul}) => {
    
    const apiContext = useContext(ApiContext)

    const [decryptionKey, setDecryptionKey] = useState()
    const [postRoot, setPostRoot] = useState({text:'loading...'})
    const [attachments, setAttachments] = useState([])
    const [comments, setComments] = useState([])
    const [profile, setProfile] = useState({name:'loading...', picture:null})

    const eventUnSubs = []

    const revokeObjectURLs = () => {
        // Make sure to revoke the data uris to avoid memory leaks
        attachments.forEach(attachment => {
            if(attachment.type == 'image'){
                URL.revokeObjectURL(attachment.objectUrl)
            }
        })
    }

    useEffect(() => {
        console.log('decrypting post')
        apiContext.businessLogic.subscribePostDecryptionKey(soul,setDecryptionKey,eventUnSubs,true)
    }, [])

    useEffect(() => {

        //wait for decryption key before loading post
        if(decryptionKey === undefined){return}

        console.log('setting post event handlers')
        apiContext.businessLogic.subscribePost(soul,setPostRoot,decryptionKey,eventUnSubs,false)
        apiContext.businessLogic.subscribePostAttachments(soul,setAttachments,decryptionKey,eventUnSubs,false)
        apiContext.businessLogic.subscribeProfile(soul,setProfile,eventUnSubs,false)
        apiContext.businessLogic.subscribeComments(soul,setComments,decryptionKey,eventUnSubs,false)

        return () => {

            console.log('dropping post event handlers')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
            return revokeObjectURLs();
        
        };

    }, [decryptionKey])

    function ProfileHeader(){
        return (
            <div className="d-flex">
                <div><ProfilePic soul={soul} size={40}/></div>
                <div className="align-self-center" style={{'fontWeight':700, 'fontSize':'20px'}}>{profile ? profile.name : 'loading...'}</div>
            </div>
        );
    }

    function AttachmentCarousel(){

        if(attachments.length){

            return (
                <Carousel className="bg-dark" indicators={attachments.length > 1 ? true : false} controls={attachments.length > 1 ? true : false}>
                {attachments.map((attachment, index) => (
                    <Carousel.Item key={index}>
                        <div className="d-flex p-2 justify-content-center align-items-center">
                            {attachment.type == 'image' && <><img src={attachment.objectUrl} style={{maxHeight:'75vh'}} className="img-fluid mx-auto d-block" /></>}
                            {attachment.type == 'url' && <LinkPreview attachment={attachment}/>}
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
                
                <AttachmentCarousel/>
                
                <div className="d-flex border-top border-bottom px-2">
                    <div className="mx-auto" style={{'fontWeight':700, 'fontSize':'10px'}}>{apiContext.businessLogic.getTimeElapsed(postRoot.created)}</div>
                    <div className="mx-auto" style={{'fontWeight':700, 'fontSize':'10px'}}>{decryptionKey ? 'Private' : 'Public'}</div>
                </div>
                <div className="d-flex">
                    <div className="flex-fill p-1">
                        <ModalController modal={Comments} modalProps={{comments:comments, encryptionKey: decryptionKey, postSoul:soul}}><Button className="btn-sm w-100"><CommentIcon/> <Badge variant="light" className="m">{comments.length}</Badge></Button></ModalController> 
                    </div>
                    <div className="flex-fill p-1">
                        <Dropdown>
                            <Dropdown.Toggle className="w-100 btn-sm"><ShareIcon/></Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>As Post (todo)</Dropdown.Item>
                                <Dropdown.Item>Copy Link (todo)</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {apiContext.businessLogic.isMine(soul) &&
                    <div className="flex-fill p-1">
                        <Dropdown>
                            <Dropdown.Toggle className="w-100 btn-sm"><ManageIcon/></Dropdown.Toggle>
                            <Dropdown.Menu>
                                <ModalController modal={CreatePost} modalProps={{postSoul:soul, postText:postRoot.text, postAttachments: attachments, postEncryptionKey: decryptionKey}}><Dropdown.Item>Edit</Dropdown.Item></ModalController>
                                 <Dropdown.Item onClick={() => apiContext.businessLogic.deletePost(soul)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    }
                </div>

            </div>
    )
}

export default Post
