import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Post from './Post'

const Posts = ({soul}) => {

    const apiContext = useContext(ApiContext)
    const [posts, setPosts] = useState([])

    let eventUnSubs

    useEffect(() => {

        console.log('setting posts event handler')
        
        apiContext.businessLogic.subscribePosts( soul, setPosts, eventUnSubs)
  
        return () => {

            console.log('dropping posts event handler')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
           
        };

    }, []);

    return (
        <div className="scrolling-wrapper">
                {!posts.length && 
                    <div className='d-flex h-100 justify-content-center align-items-center'><div style={{'fontWeight':700, 'fontSize':'10px'}}>no posts yet</div></div>
                }
            <div className="scrolling-content">
                {posts.map((post) => (
                    <Post soul={post['_']['#']} key={post.key}/>
                ))}
            </div>
        </div>
    );

}

export default Posts
