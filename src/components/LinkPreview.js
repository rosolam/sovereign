import React from 'react'
import {useState, useContext, useEffect} from 'react'
const axios = require('axios');

const LinkPreview = ({previewUrl}) => {
    
    const [previewData, setPreview] = useState({})

    useEffect(() => {

        if(!previewUrl){setPreview({available:false}); return;}

        console.log('preview request for ', previewUrl)

        const requestUrl = 'http://localhost:5001/preview?url=' + encodeURIComponent(previewUrl)

        const source = axios.CancelToken.source();
        const cancelToken = source.token;
        axios.get(requestUrl , {cancelToken})
            .then( (response) => {
                //handle response here
                console.log('preview response', response)
                setPreview({...response.data, available:true})
            })
            .catch((error) => {
                //handle error here
                console.log('preview error', error)
                setPreview({available:false})
            });

        return () => {
            //source.cancel('component unmounting')
        }

    }, [previewUrl]);

    if(previewData){
        return(
            <div>
                
                {!previewData && 
                    <>
                        <div className='bg-white rounded-corners p-1'>
                            <div className='d-flex justify-content-center text-white'>loading preview...</div>
                            <div className='d-flex justify-content-center m-2'><a href={previewUrl} target='_new'><small className='ellipsis' style={{maxWidth:'250px'}}>{previewUrl}</small></a></div>
                        </div>
                    </>
                }

                {previewData && !previewData.available &&                     
                    <>
                         <div className='bg-white rounded-corners p-1'>
                            <div className='d-flex justify-content-center m-2'><a href={previewUrl} target='_new'><h6 className='ellipsis' style={{maxWidth:'250px'}}>{previewUrl}</h6></a></div>
                        </div>
                    </>
                }
                
                {previewData && previewData.available && 
                    <div className='bg-white rounded-corners p-1'>
                        <img className='mt-1 img-fluid mx-auto d-block' src={previewData.img} style={{maxHeight:'33vh'}}/>
                        <div className='m-2'><h6>{previewData.title}</h6></div>
                        <div className='m-2'><a href={previewUrl} target='_new'><small className='text-muted ellipsis' style={{maxWidth:'250px'}}>{previewUrl}</small></a></div>
                    </div>
                }
                

    
            </div>
        )
    } else return <></>
    
}

export default LinkPreview