import React, { Component } from 'react'
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Gun from 'gun'
import SEA from 'gun/sea'
import Settings from './pages/Settings'
import ApiContext from "./api/ApiContext"

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

  render() {

    if(!this.state.isAuthenticated){
      return(
        <Login/>
      )
      
    }else{
      return(
        <ApiContext.Provider value= {{
          gun: this.gun,
          gunUser: this.gunUser,
          gunAppRoot: this.gunAppRoot
        }}>
        <BrowserRouter basename='sovereign'>
          <Switch>
            <Route path="/" exact>
              {this.state.isAuthenticated ? <Home/> : <Redirect to='/login'/>}
            </Route>
            <Route path="/test" component={Settings}/>
            <Route path="/login" component={Login}/>
          </Switch>
        </BrowserRouter>
        </ApiContext.Provider>
      )
    }

  }
}

export default App;
