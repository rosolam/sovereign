import { useState, useEffect, useContext, useRef} from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import ProfilePic from './ProfilePic'
import { BsPersonSquare} from "react-icons/bs"

const UpdateProfileModal = ({ show, onClose }) => {

    const apiContext = useContext(ApiContext)

    const [name, setName] = useState('')
    const [picture, setPicture] = useState('')
    const [file, setFile] = useState();
    const fileUploadRef = useRef(null);

    useEffect(() => {

        if(show){

            console.log('setting profile event handler')
            apiContext.businessLogic.subscribeProfile(
                false,
                (profile) => {setName(profile.name)},
                setPicture,
                false,
                false,
                false,
                true
            )

            return () => {
                
                // Make sure to revoke the data uris to avoid memory leaks
                if(picture){
                    URL.revokeObjectURL(picture)
                }
            
            }

        }

    }, [show])

    const handleFileChange = (e) => {

        // Make sure to revoke the data uris to avoid memory leaks
        if(picture){
            URL.revokeObjectURL(picture);
        }

        //capture file and preview
        setFile(e.target.files[0])
        setPicture(URL.createObjectURL(e.target.files[0]))

    }

    const handleSubmit = (e) => {

        e.preventDefault()

        //TODO validation
        if (!name) {
            alert('Please provide a name')
            return
        }

        //update profile
        apiContext.businessLogic.updateProfile({
            name: name
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
                        <Form.Control type="text" placeholder="your name..." value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formPicture">
                        <Form.File ref={fileUploadRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e,)}/>
                        <Form.Label>Picture</Form.Label>
                        <div className='d-flex'>
                                <ProfilePic src={picture} size='75px'/>
                                {apiContext.businessLogic.ipfsProvider.canPut && 
                                    <Button variant="primary" className='m-3' onClick={() => {fileUploadRef.current.click();}}><BsPersonSquare/> Upload</Button>
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
                    {!apiContext.businessLogic.ipfsProvider.canPut &&  <Button variant="warning" onClick={onClose}>Setup IPFS Now</Button>}
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Update</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default UpdateProfileModal