import React from 'react'
import { propTypes } from 'react-bootstrap/esm/Image'
import PreviewProviderLinkPreview from '../api/PreviewProviders/PreviewProviderLinkPreview'

const LinkPreview = ({attachment, disableLink}) => {

    if(attachment.title){
        return(
        <div className='bg-white rounded-corners p-1 w-100'>
            {attachment.image && <img className='mt-1 img-fluid mx-auto d-block' src={attachment.image} style={{maxHeight:'25vh'}}/>}
            <div className='m-2'><h6>{attachment.title}</h6></div>
            {!attachment.image && <div className='m-2'><small>{attachment.description}</small></div>}
            {!disableLink && <a href={attachment.url} target='_new' className='m0 stretched-link'><small className='text-muted ml-2 ellipsis' style={{maxWidth:'250px'}}>{attachment.url}</small></a>}
            {disableLink && <div className='m0'><small className='text-muted ml-2 ellipsis' style={{maxWidth:'250px'}}>{attachment.url}</small></div>}

            
        </div>
        )
    } else return (
        <div className='bg-white rounded-corners p-1'>
            {!disableLink && <div className='m-2'><a href={attachment.url} target='_new' className='ellipsis stretched-link' style={{maxWidth:'250px'}}>{attachment.url}</a></div> }
            {disableLink && <div className='m-2'><div className='ellipsis' style={{maxWidth:'250px'}}>{attachment.url}</div></div> }
        </div>
    )
    
}

export default LinkPreview