import React, { useState, useEffect, useContext } from 'react'
import ApiContext from "../ApiContext"
import Post from './Post'

const Posts = () => {

    const apiContext = useContext(ApiContext)
    const [posts, setPosts] = useState([])

    const getNewPostState = (prevState, value, key) => {

        //check to see if post exists already
        const existingPostIndex = prevState.findIndex(p => p.key === key)
        console.log('exsting index', existingPostIndex)
        if (existingPostIndex == -1) {

            //new, add post item to state
            console.log('adding post')
            const newPost = value
            newPost.key = key

            //sort the new post into the array
            return [...prevState, newPost].sort((a, b) => { return b.created - a.created })

        } else {

            //yes, a post with this id exists...
            //console.log('existing post')

            //is this an update to delete it?
            if (!value) {

                //yes, delete it
                console.log('deleting post')
                return prevState.filter(p => p.key !== key)

            } else {

                //No, has it changed?
                const existingPost = prevState[existingPostIndex]
                if (value.modified > existingPost.modified) {

                    //yes, update it
                    console.log('updating post')
                    const updatedPost = value
                    updatedPost.key = key
                    return ([...prevState.filter(p => p.key !== key),updatedPost].sort((a, b) => { return b.created - a.created }))

                } else {

                    //dupe, ignore this event
                    console.log('ignoring post')
                    return prevState

                }
            }

        }

    }

    const handlePostUpdate = (value, key, _msg, _ev) => {

        console.log('post update event', value, key)
        setPosts(prevState => getNewPostState(prevState, value, key))

    }

    useEffect(() => {

        console.log('setting post event handler')

        //handle updates to my own posts
        apiContext.gunAppRoot.get('posts').map().on((value, key, _msg, _ev) => handlePostUpdate(value, key, _msg, _ev))

        //handle updates to the posts of the users I follow
        apiContext.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on((value, key, _msg, _ev) => handlePostUpdate(value, key, _msg, _ev))

        //TODO: handle if my profile image changes... let changes to those I am following get refreshed on reloads
        //context.gunAppRoot.get('profile').get('picture').on((value, key, _msg, _ev) => this.handlePictureUpdate(value, key, _msg, _ev))

        return () => {

            console.log('dropping post event handler')

            apiContext.gunAppRoot.get('posts').map().off()
            apiContext.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().off()

        };

    }, []);

    return (
        <div>
            <div>{apiContext.test}</div>
            {posts.map((post) => (
                <Post post={post} key={post.key} />
            ))}
        </div>
    );

}

export default Posts
