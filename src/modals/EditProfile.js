import { useState, useEffect, useContext, useRef} from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import ProfilePic from '../components/ProfilePic'
import { BsPersonSquare} from "react-icons/bs"
import { Link } from 'react-router-dom';

const EditProfile = ({ show, onClose }) => {

    const apiContext = useContext(ApiContext)

    const [profileName, setProfileName] = useState('')
    const [profilePic, setProfilePic] = useState('')
    const [file, setFile] = useState();
    const fileUploadRef = useRef(null);
    const [enableSubmit, setEnableSubmit] = useState();

    useEffect(() => {

        if(show){

            console.log('fetching my profile')
            apiContext.businessLogic.subscribeProfile(null,(profile) => {setProfileName(profile.name)}, null, true)
            apiContext.businessLogic.subscribeProfilePic(null,setProfilePic, null, true)

            return () => {
                
                // Make sure to revoke the data uris to avoid memory leaks
                if(profilePic){
                    URL.revokeObjectURL(profilePic)
                }
            
            }

        }

    }, [show])

    const handleFileChange = (e) => {

        console.log('change',e)

        if(e.target.files.length == 0 ){
            //cancelled upload, just exit
            return;
        }

        // Make sure to revoke the data uris to avoid memory leaks
        if(profilePic){
            URL.revokeObjectURL(profilePic);
        }

        //capture file and preview
        setFile(e.target.files[0])
        setProfilePic(URL.createObjectURL(e.target.files[0]))

        //allow submit
        setEnableSubmit(true)

    }

    const handleSubmit = (e) => {

        e.preventDefault()

        //update profile
        apiContext.businessLogic.updateProfile({
            name: profileName
        }, file)

        //close
        onClose()

    }

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="your name..." value={profileName} onChange={(e) => {setProfileName(e.target.value);setEnableSubmit(true)}} />
                    </Form.Group>
                    <Form.Group controlId="formPicture">
                        <Form.File ref={fileUploadRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e)}/>
                        <Form.Label>Picture</Form.Label>
                        <div className='d-flex'>
                                <ProfilePic src={profilePic} size='75px'/>
                                {apiContext.businessLogic.ipfsProvider.canPut && 
                                    <Button variant="primary" className='m-3' onClick={() => {fileUploadRef.current.click();}}><BsPersonSquare/> Choose Picture</Button>
                                }
                                {!apiContext.businessLogic.ipfsProvider.canPut && 
                                    <div className='mx-4'>
                                        Note: You are unable to upload a profile picture at this time.  Please setup an IPFS service in Settings to enable distributed file sharing.
                                    </div>
                                }
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    {!apiContext.businessLogic.ipfsProvider.canPut &&  <Button variant="warning" as={Link} to="/settings/upload">Setup IPFS Now</Button>}
                    <Button variant="primary" disabled={!enableSubmit} type="submit" onClick={handleSubmit}>Update</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditProfile