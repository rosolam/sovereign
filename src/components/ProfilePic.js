import React from 'react'
import { BsPerson } from "react-icons/bs"

const ProfilePic = (props) => {
    
    return (
        <>
            {props.src && <img className="m-1 circle-image" height={props.size || '50px'} width={props.size || '50px'} src={props.src}/>}
            {!props.src && <BsPerson style={{height:props.size || '50px',width:props.size || '50px'}}/>}
        </>
    )
}

export default ProfilePic
