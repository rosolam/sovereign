import React, { useState, useEffect, useContext} from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import ApiContext from "./api/ApiContext"
import './App.css'
import Login from './pages/Login'
import Following from './pages/Following'
import Feed from './pages/Feed'


const App = () => {

  const [isLoggedIn, setLoggedIn] = useState()
  const apiContext = useContext(ApiContext)
  let eventUnSubs = []

  useEffect(() => {

    apiContext.businessLogic.subscribeLogin(setLoggedIn, eventUnSubs)
    apiContext.businessLogic.login(null, null, true)
    window.bl = apiContext.businessLogic
 
    return () => {

      eventUnSubs.forEach(u => u.off())

    };

  }, []);

  function pageNotFound(){
    return(<h1>page not found</h1>)
  }

  return (
      <BrowserRouter basename='sovereign'>
        <Switch>
          {isLoggedIn && 
            <>
              <Route path="/" exact><Redirect to="/following" /></Route>
              <Route path="/following" component={Following} />
              <Route path="/feed/:soul" component={Feed} />
            </>
          }
          {!isLoggedIn && 
            <Route path="/" component={Login}/>
          }
        </Switch>
      </BrowserRouter>
  )

}

export default App