import { useState, useContext, useEffect, useRef } from 'react'
import { Modal, Form, Button, ButtonGroup, Carousel, Dropdown } from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import { BsLink45Deg, BsImages, BsPaperclip, BsFillXSquareFill} from "react-icons/bs"
import LinkPreview from '../components/LinkPreview'
import crypto from 'crypto'

const CreatePost = ({ show, onClose }) => {

    const apiContext = useContext(ApiContext)

    const [text, setText] = useState('')
    const [attachments, setAttachments] = useState([]);
    const [isPublic, setIsPublic] = useState(false)
    const [url, setUrl] = useState('')
    const [urlIsValid, setUrlIsValid] = useState(false)
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [postEnabled, setPostEnabled] = useState();

    const handleCarouselSelect = (selectedIndex, e) => {
        //manually controlling the carousel index was necessary to prevent deletion of the last index from breaking the bootstrap component
        setCarouselIndex(selectedIndex);
    };

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

    //revoke any object urls when this component is unmounted
    useEffect(() => {     
        return revokeObjectURLs();
    }, []);

    //reset the form whenever closing the modal
    useEffect(() => {
        
        if(!show){
            revokeObjectURLs()
            setText('')
            setAttachments([]);
            setUrl('')
            setUrlIsValid(false)
            setIsPublic(false)
        }

    }, [show]);

    //manage whether url link is valid and can be attached or not
    useEffect(() => {
    
        const urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        const isValid = urlRegex.test(url)
        setUrlIsValid(isValid)
    }, [url]);

    useEffect(() => {
        setCarouselIndex(0);
    }, [attachments])

    useEffect(() => {
        setPostEnabled(text || attachments.length)
    }, [text, attachments])

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

        //enrich attachment
        for(const file of e.target.files){
            if(fileUploadType=='image'){file.preview = URL.createObjectURL(file)}
            file.key = crypto.randomBytes(20).toString('hex')
        }

        setAttachments([...e.target.files, ...attachments])

    }

    const handleUrlAdd = async () => {

        //ensure url has a protocol specified, default to 'http://'
        const addUrl = url.includes('://') ? url : 'http://' + url
 
        //enrich with preview and key
        const attachment = {
            ...await apiContext.businessLogic.getPreview(addUrl),
            url: addUrl,
            type: 'url',
            key: crypto.randomBytes(20).toString('hex')
        }
        
        //reset and add
        setUrl('')
        setAttachments([attachment,...attachments])
        
    }

    const handleDelete = (key) => {

        //get the item to delete
        const deletedAttachment = attachments.find((v) => {return v.key==key})
        
        //prepare new attachmnets to set to state
        const updatedAttachments = [...attachments].filter((v) => {return v != deletedAttachment})
        
        //revoke blob preview if necessary
        if(deletedAttachment.preview){
            URL.revokeObjectURL(deletedAttachment.preview)
        }

        //update attachments
        setAttachments(updatedAttachments)

        //important: reset carousel index manually to prevent it from being broken
        setCarouselIndex(0);
    }

    const handleSubmit = (e) => {

        e.preventDefault()

        //TODO better validation
        if (!text && !attachments.length) {
            alert('Oops, nothing to post!')
            return
        }

        //create post
        apiContext.businessLogic.createPost({
            text: text
        }, attachments, !isPublic)

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

                        <Form.Control as='textarea' rows='2' placeholder="your post..." value={text} onChange={(e) => setText(e.target.value)} />
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
                    <Carousel activeIndex={carouselIndex} onSelect={handleCarouselSelect} className="bg-dark" interval={null} indicators={attachments.length > 1 ? true : false} controls={attachments.length > 1 ? true : false}>
                        {attachments.map((attachment, index) => (
                            <Carousel.Item key={attachment.key}>
                                <div style={{minHeight:'275px'}} className="d-flex p-2 justify-content-center align-items-center">
                                    <Button style={{position:'absolute', top:'0px'}} size='md' className='p-1 m-3' variant="danger" onClick={() => handleDelete(attachment.key)}><BsFillXSquareFill className='mr-2'/>Remove</Button>
                                    {attachment.type.startsWith('image/') && <img src={attachment.preview} style={{maxHeight:'275px'}}className="img-fluid mx-auto d-block" />}
                                    {attachment.type == 'url' && <div style={{minHeight:'125px', maxHeight:'250px'}} ><LinkPreview attachment={attachment}/></div>}
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>

                </Modal.Body>
                <Modal.Footer>
                    <Form.Check type='radio' inline label='Public' checked={isPublic} onChange={() => setIsPublic(!isPublic)}/>
                    <Form.Check type='radio' inline label='Private' checked={!isPublic} onChange={() => setIsPublic(!isPublic)}/>
                    <Button variant="primary" disabled={!postEnabled} className="ml-3" type="submit" onClick={handleSubmit}>Post</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreatePost