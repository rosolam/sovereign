import React, { Component } from 'react';
import './App.css';
import Header from './components/Header'
import Posts from './components/Posts'
import NewPostsModal from './components/NewPostModal'
import Gun from 'gun'
import SEA from 'gun/sea'

class App extends Component {

  constructor(){
    super()
    this.gun = Gun()//"http://192.168.1.99:8080/gun")
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

  handleUserAuthed(ack) {
    console.log("auth event", ack)
    this.gunAppRoot = this.gunUser.get('sovereign')
    window.gunAppRoot = this.gunAppRoot
    this.setState({isAuthenticated: true} )    
  }

  handleUserUpdate(ack){

  }

  handleProfileUpdate(ack){

  }

  render() {
    return (
      <div className="App">
      
      <Header/>
      
      {this.state.isAuthenticated && <NewPostsModal gunAppRoot={this.gunAppRoot}/>}
      {this.state.isAuthenticated && <Posts gunAppRoot={this.gunAppRoot}/>}
        
      {!this.state.isAuthenticated && (
        <div>You need to login first</div>
      )}
      
     </div>
    );
  }
}

export default App;
