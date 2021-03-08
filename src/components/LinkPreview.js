import React from 'react'
import { propTypes } from 'react-bootstrap/esm/Image'
import PreviewProviderLinkPreview from '../api/PreviewProviders/PreviewProviderLinkPreview'

const LinkPreview = ({attachment}) => {

    if(attachment.title){
        return(
        <div className='bg-white rounded-corners p-1 w-100'>
            {attachment.image && <img className='mt-1 img-fluid mx-auto d-block' src={attachment.image} style={{maxHeight:'33vh'}}/>}
            <div className='m-2'><h6>{attachment.title}</h6></div>
            {!attachment.image && <div className='m-2'><small>{attachment.description}</small></div>}
            <div className='m-2'><a href={attachment.url} target='_new'><small className='text-muted ellipsis' style={{maxWidth:'250px'}}>{attachment.url}</small></a></div>
        </div>
        )
    } else return (
        <div className='bg-white rounded-corners p-1'>
            <div className='m-2'><a href={attachment.url} target='_new' className='ellipsis' style={{maxWidth:'250px'}}>{attachment.url}</a></div>
        </div>
    )
    
}

export default LinkPreview