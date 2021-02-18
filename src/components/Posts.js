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

        //TODO: handle if my profile image changes... let changes to those I am following get refreshed on reloads
        //this.gunAppRoot.get('profile').get('picture').on((value, key, _msg, _ev) => this.handlePictureUpdate(value, key, _msg, _ev))

      }

    componentWillUnmount(){

        console.log('dropping post event handler')

        this.gunAppRoot.get('posts').map().off()
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().off()

    }

    handlePostUpdate(value, key, _msg, _ev){

        console.log('post update event', value,key)

        //check to see if post exists already
        const existingPostIndex = this.state.posts.findIndex(p => p.key === key)
        //console.log('exsting index', existingPostIndex)
        if(existingPostIndex == -1){

            //new, add post item to state
            //console.log('adding post')
            const newPost = value
            newPost.key = key

            //sort the new post into the array
            this.setState(prevState => ({posts: [...prevState.posts,newPost].sort((a,b) => {return b.created - a.created})}))

        } else {

            //yes, a post with this id exists...
            //console.log('existing post')

            //is this an update to delete it?
            if(!value){

                //yes, delete it
                console.log('deleting post')
                this.setState(prevState => ({posts: prevState.posts.filter(p => p.key !== key)}))
                
            } else {

                //No, has it changed?
                const existingPost = this.state.posts[existingPostIndex]
                if(value.modified > existingPost.modified){

                    //yes, update it
                    console.log('updating post')
                    const updatedPost = value
                    updatedPost.key = key
                    this.setState(prevState => ({posts: [...prevState.posts.filter(p => p.key !== key),
                        updatedPost].sort((a,b) => {return b.created - a.created})}))

                } else {
                    
                    //dupe, ignore this event
                    console.log('ignoring post')

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
