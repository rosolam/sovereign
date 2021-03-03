import { useState, useContext, useEffect, useRef } from 'react'
import { Modal, Form, Button, ButtonGroup, Carousel, Dropdown } from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import { BsLink45Deg, BsImages, BsPaperclip, BsCloudUpload } from "react-icons/bs"
import LinkPreview from './LinkPreview'

const NewPostModal = ({ show, onClose }) => {

    const apiContext = useContext(ApiContext)

    const [text, setText] = useState('')
    const [attachments, setAttachments] = useState([]);
    const [url, setUrl] = useState('')
    const [urlIsValid, setUrlIsValid] = useState(false)

    const fileUploadRef = useRef(null);
    let fileUploadType

    const revokeObjectURLs = () => {
        // Make sure to revoke the data uris to avoid memory leaks
        attachments.forEach(attachment => {
            if(attachment.preview){
                URL.revokeObjectURL(attachment.preview)
            }
        })
    }

    useEffect(() => {
        return revokeObjectURLs();
    }, []);

    useEffect(() => {
        
        if(!show){
            //reset the form whenever closing the modal
            revokeObjectURLs()
            setText('')
            setAttachments([]);
            setUrl('')
            setUrlIsValid(false)
        }

    }, [show]);

    const handlePictureClick = () => {
        fileUploadRef.current.accept = "image/*"
        fileUploadType = 'image'
        fileUploadRef.current.click()
    }
    const handleFileClick = () => {
        fileUploadRef.current.accept = "*"
        fileUploadType = 'file'
        fileUploadRef.current.click()
    }

    const handleFileChange = (e) => {

        console.log(e.target.files[0])

        //generate preview for images
        if(fileUploadType=='image'){
            for(const file of e.target.files){
                file.preview = URL.createObjectURL(file)
            }
        }

        setAttachments([...e.target.files, ...attachments])

    }

    useEffect(() => {
        const urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        const isValid = urlRegex.test(url)
        setUrlIsValid(isValid)
    }, [url]);

    const handleUrlAdd = () => {

        const attachment = {
            type: 'url',
            url: url,
        }
        setUrl('')
        setAttachments([attachment,...attachments])
        
    }

    const handleSubmit = (e) => {

        e.preventDefault()

        //TODO validation
        if (!text && !attachments.length) {
            alert('Oops, nothing to post!')
            return
        }

        //create post
        apiContext.businessLogic.createPost({
            text: text
        }, attachments)

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

                    <Form.Group>
                        <Form.Control as='textarea' rows='3' placeholder="your post..." value={text} onChange={(e) => setText(e.target.value)} />
                        <Form.File ref={fileUploadRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e,)} multiple/>
                        <div className='d-flex w-100 my-1'>
                            <ButtonGroup className='mr-1 w-100'>
                                <Form.Control type='text' placeholder="https://www.link.here" value={url} onChange={(e) => setUrl(e.target.value)} />
                                <Button variant="primary" disabled={!urlIsValid} onClick={handleUrlAdd}><BsLink45Deg /></Button>
                            </ButtonGroup>
                            <Button variant="primary" className='mr-1' onClick={handlePictureClick}><BsImages /></Button>
                            <Button variant="primary" onClick={handleFileClick}><BsPaperclip /></Button>
                        </div>
                    </Form.Group>
                    <Carousel className="bg-dark" interval={null} indicators={attachments.length > 1 ? true : false} controls={attachments.length > 1 ? true : false}>
                        {attachments.map((attachment, index) => (
                            <Carousel.Item key={index}>
                                <div style={{minHeight:'275px'}} className="d-flex p-2 justify-content-center align-items-center">
                                    {attachment.type.startsWith('image/') && <img src={attachment.preview} style={{maxHeight:'275px'}}className="img-fluid mx-auto d-block" />}
                                    {attachment.type == 'url' && <div style={{minHeight:'125px'}} ><LinkPreview previewUrl={attachment.url}/></div>}
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>

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