import Post from './Post'
import React, { Component } from 'react';

class Posts extends React.Component{

    constructor(props){
        super(props);
        this.gunAppRoot = props.gunAppRoot
        
        this.state = { 
            posts: []
        }

    }

    componentDidMount(){
 
        console.log('setting post event handler')

        //handle updates to my own posts
        this.gunAppRoot.get('posts').map().on((value, key, _msg, _ev) => this.handlePostUpdate(value, key, _msg, _ev))

        //handle updates to the posts of the users I follow
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on((value, key, _msg, _ev) => this.handlePostUpdate(value, key, _msg, _ev))      

      }

    handlePostUpdate(value, key, _msg, _ev){

        //console.log('post update event', value,key)

        //check to see if post exists already
        const existingPostIndex = this.state.posts.findIndex(p => p.key === key)
        //console.log('exsting index', existingPostIndex)
        if(existingPostIndex == -1){

            //new, add post item to state
            //console.log('adding post')
            const newPost = value
            newPost.key = key
            
            //sort the new post into the array
            const updatedPosts = [...this.state.posts]
            let insertionIndex = updatedPosts.findIndex(p => p.created > newPost.created)
            if(insertionIndex == -1){ insertionIndex = updatedPosts.length} //handle adding to end if largest sort
            updatedPosts.splice(insertionIndex,0,newPost)

            //update state
            this.setState({posts: updatedPosts})

        } else {

            //yes, a post with this id exists...
            //console.log('existing post')

            //is this an update to delete it?
            if(!value){

                //yes, delete it
                //console.log('deleting post')
                const updatedPosts = [...this.state.posts]
                updatedPosts.splice(existingPostIndex,1)
                this.setState({posts: updatedPosts})
                
            } else {

                //No, has it changed?
                const existingPost = this.state.posts[existingPostIndex]
                if(value.modified > existingPost.modified){

                    //yes, update it
                    //console.log('updating post')
                    const updatedPosts = [...this.state.posts]
                    const updatedPost = value
                    updatedPost.key = key
                    updatedPosts[existingPostIndex] = updatedPost
                    this.setState({posts: updatedPosts})

                } else {
                    
                    //dupe, ignore this event
                    //console.log('ignoring post')

                }
            }

        }

    }
    
    render() {
        return (
            <div>
                {this.state.posts.map((post) => (
                    <Post post={post} key={post.key}/>
                ))}
            </div>
        );
    }
} 

export default Posts
