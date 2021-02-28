import { useState, useEffect, useContext } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import { useDropzone } from 'react-dropzone';
import missingProfileImage from '../media/missing-profile-picture.png'

const UpdateProfileModal = ({ show, onClose }) => {

    const apiContext = useContext(ApiContext)

    const [name, setName] = useState('')
    const [picture, setPicture] = useState('')
    const [file, setFile] = useState();

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {

            //only accept first file
            const file = acceptedFiles[0]
            setPicture(URL.createObjectURL(file))

        }
    });



    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        URL.revokeObjectURL(picture);
    }, [picture]);

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
        }, acceptedFiles[0])

        //close
        onClose()

    }

    const loadProfile = (profile) => {
        setName(profile ? profile.name : '')
        setPicture(profile ? profile.name : '')
    }

    useEffect(() => {
        apiContext.businessLogic.getProfile(null, loadProfile)
    }, [])

    const dropZone = 
        <div {...getRootProps()} className='ml-3 dropzone'>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
        </div>

    const setupIpfs = 
        <div className='mx-4'>Note: You are unable to upload a profile picture at this time.  Please setup an IPFS service in Settings to enable distributed file sharing.</div>

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
                        <Form.Label>Picture</Form.Label>
                        <div className='d-flex'>
                                <img src={picture} style={{ width: '75px', height: '75px' }} onError={(e)=>{e.target.onerror = null; e.target.src=missingProfileImage}}  />

                                {apiContext.businessLogic.ipfsProvider.canPut && dropZone}
                                {!apiContext.businessLogic.ipfsProvider.canPut && setupIpfs}
                                

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