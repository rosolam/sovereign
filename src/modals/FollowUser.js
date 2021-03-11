import {useState, useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'

const FollowUser = ({show, onClose}) => {
    
    const apiContext = useContext(ApiContext)

    const [soul, setSoul] = useState('')
  
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!soul){
            alert('Please provide a user id')
            return
        }

        //follow user
        apiContext.businessLogic.followUser(soul)

        //close
        onClose()

    } 
  
    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Follow User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formUserAddress">
                        <Form.Label>User Address</Form.Label>
                        <Form.Control type="text" placeholder="user's address..." value={soul} onChange={(e) => setSoul(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Follow!</Button>
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default FollowUser