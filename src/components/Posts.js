import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../api/ApiContext"
import Post from './Post'

const Posts = () => {

    const apiContext = useContext(ApiContext)
    const [posts, setPosts] = useState([])

    let eventUnSubs

    useEffect(() => {

        console.log('setting post event handler')
        apiContext.businessLogic.subscribePosts(setPosts, eventUnSubs)
  
        return () => {

            console.log('dropping post event handler')
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
