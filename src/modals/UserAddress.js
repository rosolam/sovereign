import {useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import QRCode from 'qrcode.react'

const UserAddress = ({show, onClose, soul}) => {
    
    const apiContext = useContext(ApiContext)
    let textAreaRef
    const shareUrl = window.location.href.substring(0, window.location.href.indexOf('#')) + '#/feed/' + soul

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
                        <Form.Control ref={(textarea) => textAreaRef = textarea} as="textarea" rows="4" size='md' value={shareUrl} readOnly/>
                        <div className='d-flex justify-content-center m-3'>
                            <QRCode value={shareUrl}/>
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Copy To Clipboard</Button>
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default UserAddress