import {useState} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'

const FollowUserModal = ({onFollowUser}) => {
    const [show, setShow] = useState(false)
    const [userId, setUserId] = useState('')
  
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!userId){
            alert('Please provide a user id')
            return
        }
        
        //follow user
        onFollowUser({
            userId: userId
        })

        //close the form
        setShow(false)

        //reset the form via the state
        setUserId('')

    } 
  
    return (
        <>
            <Button variant="primary" onClick={handleShow}>Follow User</Button>

            <Modal show={show} onHide={handleClose}>
                <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Follow User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>User Address</Form.Label>
                        <Form.Control type="text" placeholder="user's address..." value={userId} onChange={(e) => setUserId(e.target.value)} />
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