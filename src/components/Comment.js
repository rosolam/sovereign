import ProfilePic from "./ProfilePic"
import ApiContext from '../api/ApiContext'
import {useContext} from 'react'
import { BsFillTrashFill as DeleteIcon } from "react-icons/bs"
import ProfileName from "./ProfileName"
import { Button } from 'react-bootstrap'

const Comment = ({comment}) => {
    
    const apiContext = useContext(ApiContext)
    const canDelete = apiContext.businessLogic.isMine(comment.user) || apiContext.businessLogic.isMine(comment.soul)

    const deleteComment = () => {
        apiContext.businessLogic.deleteComment(comment.soul)
    }

    return (
        <div className='border bg-light rounded-corners m-1 p-1'>
            <div className='d-flex align-items-center'>
                <ProfilePic soul={comment.user}/>
                <div className='ml-2'>
                    <ProfileName soul={comment.user}/>
                    {comment.text}
                </div>
            </div>
            <div className='d-flex'>
                <div className='ml-2' style={{'fontWeight':700, 'fontSize':'10px'}}>{apiContext.businessLogic.getTimeElapsed(comment.created)}</div>
                {canDelete && <Button variant="primary" onClick={deleteComment} className='ml-auto' size='sm'><DeleteIcon/></Button>}
            </div>
        </div>
    )
}

export default Comment
