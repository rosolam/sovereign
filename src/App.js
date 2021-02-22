import React, { Component } from 'react'
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import './App.css'
import SingleFeed from './pages/SingleFeed'
import Login from './pages/Login'
import Gun from 'gun'
import SEA from 'gun/sea'
import Settings from './pages/Settings'
import ApiContext from "./api/ApiContext"
import SingleProfile from './pages/SingleProfile'
import FollowingProfile from './pages/FollowingProfiles'
import FollowingFeed from './pages/FollowingFeed'
import BusinessLogic from './api/BusinessLogic'

class App extends Component {

   constructor(){
    super()
    this.gun = Gun("http://192.168.1.99:8080/gun")
    this.gunUser = this.gun.user()
    this.businessLogic = new BusinessLogic(this.gun, this.gunUser)
    this.state = {
      isAuthenticated: false
    }    
    //To have access to gun object in browser console
    window.gun = this.gun 
    window.gunUser = this.gunUser
  }
  
  componentDidMount(){
    console.log('setting gun auth handler')
    this.gun.on('auth', ack => this.handleUserAuthed(ack))
    this.gunUser.recall({sessionStorage: true})
  }

  handleUserAuthed = (ack) => {
    console.log("auth event", ack)
    this.gunAppRoot = this.gunUser.get('sovereign')
    window.gunAppRoot = this.gunAppRoot
    this.businessLogic.gunAppRoot = this.gunAppRoot
    this.setState({isAuthenticated: true} )    
  }

  render() {

      if(!this.state.isAuthenticated){
        return <Login/>
      }

      return(
        <ApiContext.Provider value= {{
          gun: this.gun,
          gunUser: this.gunUser,
          gunAppRoot: this.gunAppRoot,
          soul: this.gunUser._.soul,
          businessLogic: this.businessLogic
        }}>
        <BrowserRouter basename='sovereign'>
          <Switch>
            <Route path="/" exact>
              <Redirect to="/followingFeed"/>
            </Route>
            <Route path="/singleFeed/:id" component={SingleFeed}/>
            <Route path="/singleProfile/:id" component={SingleProfile}/>
            <Route path="/followingFeed" component={FollowingFeed}/>
            <Route path="/followingProfiles" component={FollowingProfile}/>
            <Route path="/settings" component={Settings}/>
            <Route path="/login" component={Login}/>
          </Switch>
        </BrowserRouter>
        </ApiContext.Provider>
      )
    }
}

export default App;
