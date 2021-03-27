import {useState, useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'

const FollowUser = ({show, onClose}) => {
    
    const apiContext = useContext(ApiContext)

    const [soulAddress, setSoulAddress] = useState('')
  
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!soulAddress){
            alert('Please provide a user id')
            return
        }

        //follow user
        const soul = soulAddress.substr(soulAddress.indexOf('~')).trim()
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
                        <Form.Control type="text" placeholder="user's address..." value={soulAddress} onChange={(e) => setSoulAddress(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit" disabled={!soulAddress} onClick={handleSubmit}>Follow</Button>
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default FollowUser