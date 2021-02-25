import {useState, useContext} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'

const NewPostModal = ({show, onClose}) => {

    const apiContext = useContext(ApiContext)

    const [text, setText] = useState('')
  
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!text){
            alert('Please add text for your post')
            return
        }

        //create post
        apiContext.businessLogic.createPost({
            text: text
        })

        //reset the form via the state
        //setText('')

        //close the form
        onClose()

    } 
  
    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Text</Form.Label>
                        <Form.Control type="text" placeholder="your post..." value={text} onChange={(e) => setText(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Post!</Button>
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default NewPostModal