import {useState, useContext, useEffect} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import { useDropzone } from 'react-dropzone';

const NewPostModal = ({show, onClose}) => {

    const apiContext = useContext(ApiContext)

    const [text, setText] = useState('')
    const [files, setFiles] = useState([]);
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
      accept: 'image/*',
      onDrop: acceptedFiles => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        })));
      }
    });

    const thumbs = files.map(file => (
        <div key={file.name}>
            <img src={file.preview} width='50px'/>
        </div>
      ));
    
    useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

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
        }, files)

        //reset the form via the state
        //setText('')

        //close the form
        onClose()

    } 
  
    const dropZone = 
        <div {...getRootProps()} className='dropzone'>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
            <div className='d-flex' style={{flexWrap:'wrap'}}>{thumbs}</div>
        </div>

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Post</Form.Label>
                        <Form.Control as='textarea' rows='5' placeholder="your post..." value={text} onChange={(e) => setText(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formPictures">
                        <Form.Label>Pictures</Form.Label>
                        {dropZone}                        
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