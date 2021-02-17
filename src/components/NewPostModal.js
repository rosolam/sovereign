import {useState} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'

const NewPostModal = ({onCreatePost}) => {
    const [show, setShow] = useState(false)
    const [text, setText] = useState('')
  
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!text){
            alert('Please add text for your post')
            return
        }

        //create post
        onCreatePost({
            text: text
        })

        //close the form
        setShow(false)

        //reset the form via the state
        setText('')

    } 
  
    return (
        <>
            <Button variant="primary" onClick={handleShow}>New Post</Button>

            <Modal show={show} onHide={handleClose}>
                <form onSubmit={handleSubmit}>
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
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" type="submit" onClick={handleClose}>Post!</Button>
                </Modal.Footer>
                </form>
            </Modal>
      </>
    );
}

export default NewPostModal