import missingProfileImage from '../media/missing-profile-picture.png'
import {Dropdown, Carousel} from 'react-bootstrap'
import { useState, useEffect,useContext} from 'react'
import ApiContext from '../api/ApiContext'

const Post = ({soul, isSingleUser}) => {
    
    const apiContext = useContext(ApiContext)

    const [postRoot, setPostRoot] = useState({text:'loading...'})
    const [attachments, setAttachments] = useState([])
    const [profile, setProfile] = useState({name:'loading...', picture:null})

    useEffect(() => {

        console.log('calling for data from inside post ', soul)
        apiContext.businessLogic.getPost(soul,
            setPostRoot,
            setAttachments, 
            setProfile)

    }, [])

    function LargeProfileHeader(){
        return (
            <div className="d-flex">
                <div><img className="m-3 rounded" height="50" src={profile ? profile.picture : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} /></div>
                <div className="align-self-center">
                    <h4>{profile ? profile.name : 'loading...'}</h4>
                </div>
            </div>
        );
    }

    function SmallProfileHeader(){
        return (
            <div className="d-flex">
                <div><img className="m-3 rounded" height="25" src={profile ? profile.picture : 'missing'} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}} /></div>
                <div className="align-self-center">
                    <h6>{profile ? profile.name : 'loading...'}</h6>
                </div>
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

    console.log('rendering post ', soul)

    return (

            <div className="border post m-3 p-3 d-flex flex-column justify-content-start bg-light rounded-corners">
        
                {isSingleUser ? <SmallProfileHeader/> : <LargeProfileHeader/>}
        
                <div className="d-flex">
                    <div className="flex-grow-1 post-text">
                        <h3>{postRoot.text}</h3>
                    </div>
                </div>

                <ImageSpot/>

                <div className="d-flex">
                    <div><small><i>{Date(postRoot.created)}</i></small></div>
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
