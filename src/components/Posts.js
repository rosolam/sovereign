import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Post from './Post'

const Posts = ({soul}) => {

    const apiContext = useContext(ApiContext)
    const [posts, setPosts] = useState([])

    let eventUnSubs

    useEffect(() => {

        console.log('setting posts event handler')
        
        apiContext.businessLogic.subscribePosts(setPosts, soul, eventUnSubs)
  
        return () => {

            console.log('dropping posts event handler')
            if(eventUnSubs){
                eventUnSubs.forEach(u => u.off())
            }
           
        };

    }, []);

    return (
        <div className="scrolling-wrapper">
            <div className="scrolling-content">
                {posts.map((post) => (
                    <Post soul={post['_']['#']} key={post.key}/>
                ))}
            </div>
        </div>
    );

}

export default Posts
