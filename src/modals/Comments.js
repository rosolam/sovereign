import {useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'

const Comments = ({show, onClose, comments}) => {
    
    const apiContext = useContext(ApiContext)
    let textAreaRef

    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //copy to clipboard
        textAreaRef.select()
        document.execCommand("copy")

        //close
        onClose()

    } 
  
    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Sovereign Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formUserAddress">
                        <Form.Label>Address</Form.Label>
                        <Form.Control ref={(textarea) => textAreaRef = textarea} as="textarea" rows="3" size='md' value={soul} readOnly/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Copy To Clipboard</Button>
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default Comments