import {useState, useEffect} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import {UpdateProfile, GetProfile} from '../api/BusinessLogic'

const UpdateProfileModal = () => {
    const [show, setShow] = useState(false)
    const [name, setName] = useState(profile.name)
    const [picture, setPicture] = useState(profile.picture)
  
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
        UpdateProfile({
            name: name,
            picture: picture
        })

        //close the form
        setShow(false)

    } 
  
    const loadProfile = (profile) => {
        setName(profile.name)
        setPicture(profile.picture)
    }

    useEffect(() => {
        GetProfile(loadProfile)
    }, [])

    return (
        <>
            <Button variant="primary" onClick={handleShow}>Follow User</Button>

            <Modal show={show} onHide={handleClose}>
                <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Follow User</Modal.Title>
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

export default FollowUserModal