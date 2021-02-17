import React, { Component } from 'react'
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Posts from './components/Posts'
import Home from './components/Home'
import Profiles from './components/Profiles'
import NewPostsModal from './components/NewPostModal'
import FollowUserModal from './components/FollowUserModal'
import Login from './components/Login'
import Gun from 'gun'
import SEA from 'gun/sea'
import Settings from './components/Settings'

class App extends Component {

  constructor(){
    super()
    this.gun = Gun("http://192.168.1.99:8080/gun")
    this.gunUser = this.gun.user()
    this.state = {
      isAuthenticated: false
    }    
    //To have access to gun object in browser console
    window.gun = this.gun 
    window.gunUser = this.gunUser
  }
  
  componentDidMount(){
    console.log('settin gun auth handler')
    this.gun.on('auth', ack => this.handleUserAuthed(ack))
    this.gunUser.recall({sessionStorage: true})
  }

  handleUserAuthed = (ack) => {
    console.log("auth event", ack)
    this.gunAppRoot = this.gunUser.get('sovereign')
    window.gunAppRoot = this.gunAppRoot
    this.setState({isAuthenticated: true} )    
  }

  handleCreatePost = (post) => {

    //create new post
    const created = new Date().getTime()
    this.gunAppRoot.get('posts').set({
      text: post.text,
      created: created,
      modified: created
    })

  }

  handleFollowUser = (follow) => {

    //get user referecne
    const userRef = this.gun.get(follow.soul)

    //follow user
    this.gunAppRoot.get('following').get(follow.soul).put({trusted: false,mute: false}).get('user').put(userRef);

  }

  render() {

    const homeRoute = () => {
      return (<div className="app">
        <Home
          header={<Header/>}
          followModal={<FollowUserModal onFollowUser={this.handleFollowUser}/>}
          newPostModal={<NewPostsModal onCreatePost={this.handleCreatePost}/>}
          profiles={<Profiles gunAppRoot={this.gunAppRoot}/>}
          posts={<Posts gunAppRoot={this.gunAppRoot}/>}
        />
      </div>)
    };

    if(!this.state.isAuthenticated){
      return(
        <Login/>
      )
      
    }else{
      return(
        <BrowserRouter basename='sovereign'>
          <Switch>
            <Route path="/" component={homeRoute} exact/>
            <Route path="/test" component={Settings}/>
          </Switch>
        </BrowserRouter>
      )
    }

  }
}

export default App;
