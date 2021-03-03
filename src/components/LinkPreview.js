import React from 'react'
import {useState, useContext, useEffect} from 'react'
const axios = require('axios');

const LinkPreview = ({text}) => {
    
    const [previewUrl, setPreviewUrl] = useState(false)
    const [preview, setPreview] = useState({})

    useEffect(() => {

        if(!preview){return;}

        //try and grab the first url in the post
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*) /g
        const matches = text.match(urlRegex)

        //found one?
        if(matches && matches.length){

            //grab it
            const url = matches[0]
            console.log('match', url)

            //does it match state?
            if(!previewUrl || previewUrl != url){
                //no, update it
                setPreviewUrl(url)
            }

        } else {

            //is there a state?
            if(previewUrl){
                //yes, clear it
                setPreviewUrl(false)
            }

        }
    }, [text]);

    useEffect(() => {

        if(!previewUrl){setPreview({}); return;}

        console.log('preview request for ', previewUrl)

        const requestUrl = 'http://localhost:5001/preview?url=' + encodeURIComponent(previewUrl)

        const source = axios.CancelToken.source();
        const cancelToken = source.token;
        axios.get(requestUrl , {cancelToken})
            .then( (response) => {
                //handle response here
                console.log('preview response', response)
                setPreview(response.data)
            })
            .catch((error) => {
                //handle error here
                console.log('preview error', error)
            });

        return () => {
            source.cancel('component unmounting')
        }

    }, [previewUrl]);

    if(preview){
        return(
            <div>
                <a href={previewUrl} target='_new'>{preview.title ? preview.title : previewUrl}</a>
                {!preview && <div>loading preview...</div>}
                {preview && 
                <div className='d-flex'>
                    <img className='ml-1 mt-3' src={preview.img} style={{height:'100%',width:'100%',maxWidth:'33vw'}}/>
                    <div className='m-2'><i>{preview.description}</i></div>
                </div>}

    
            </div>
        )
    } else return <></>
    
}

export default LinkPreview