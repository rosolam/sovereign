import {useContext, useState, useEffect} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'
import ApiContext from '../api/ApiContext'
import Comment from '../components/Comment'
import { BsFillChatQuoteFill as SubmitIcon } from "react-icons/bs"

const Comments = ({show, onClose, comments, encryptionKey, postSoul}) => {
    
    const apiContext = useContext(ApiContext)
    const [newComment, setNewComment] = useState('')
    const [isTrusted, setIsTrusted] = useState()
    const eventUnSubs = []

    useEffect(() => {
        apiContext.businessLogic.subscribeTrusted(postSoul,setIsTrusted,eventUnSubs,true)
    }, [])

    const createComment = () => {
        apiContext.businessLogic.createComment(postSoul, encryptionKey, newComment)
        setNewComment('')
    }

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Comments</Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-2'>
                {!comments.length && <div className='d-flex justify-content-center small'>... no comments yet ...</div>}

                <div className="scrolling-wrapper" style={{height:'50vh'}}>
                    <div className="scrolling-content">
                        {comments.map((comment) => (
                            <Comment comment={comment} key={comment.key}/>
                        ))}
                    </div>
                </div>
                    
                </Modal.Body>
                <Modal.Footer>
                    {isTrusted &&
                        <div className="d-flex w-100">
                            <Form.Control className='w-100 mr-1' as="textarea" rows="2" size='sm' value={newComment} onChange={(e) => setNewComment(e.target.value)}/>
                            <Button variant="primary" onClick={createComment} disabled={!newComment}><SubmitIcon/></Button>
                        </div>
                    }
                </Modal.Footer>
            </Modal>
      </>
    );
}

export default Comments