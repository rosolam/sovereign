import {useState, useEffect, useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'

const UpdateProfileModal = () => {
    
    const apiContext = useContext(ApiContext)
    
    const [show, setShow] = useState(false)
    const [name, setName] = useState('')
    const [picture, setPicture] = useState('')
  
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!name){
            alert('Please provide a name')
            return
        }
        
        //follow user
        apiContext.businessLogic.updateProfile({
            name: name,
            picture: picture
        })

        //close the form
        setShow(false)

    } 
  
    const loadProfile = (profile) => {
        setName(profile ? profile.name : '')
        setPicture(profile ? profile.name : '')
    }

    useEffect(() => {
        apiContext.businessLogic.getProfile(null, loadProfile)
    }, [])

    return (
        <>
            <Button variant="primary" onClick={handleShow}>Update Profile</Button>

            <Modal show={show} onHide={handleClose}>
                <form onSubmit={handleSubmit}>
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
                        <Form.Control type="text" placeholder="your picture..." value={picture} onChange={(e) => setPicture(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleClose}>Follow!</Button>
                </Modal.Footer>
                </form>
            </Modal>
      </>
    );
}

export default UpdateProfileModal