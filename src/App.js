import React, { useState, useEffect} from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import './App.css'
import SingleFeed from './pages/SingleFeed'
import Login from './pages/Login'
import Settings from './pages/Settings'
import SingleProfile from './pages/SingleProfile'
import FollowingProfile from './pages/FollowingProfiles'
import FollowingFeed from './pages/FollowingFeed'
import SplitScreen from './pages/SplitScreen'
import BusinessLogic from './api/BusinessLogic'
import ApiContext from "./api/ApiContext"

const App = () => {

  const [isLoggedIn, setLoggedIn] = useState(false)
  const [businessLogic, setBusinessLogic] = useState()
  
  useEffect(() => {

    console.log('initializing app business logic')
    const bl = new BusinessLogic()
    setBusinessLogic(bl)
    bl.login(null, null, true, setLoggedIn)
    window.bl = bl

    return () => {

      console.log('disposing app business logic')
      bl.dispose()

    };

  }, []);

  return (
    <ApiContext.Provider value={{businessLogic: businessLogic}}>
      <BrowserRouter basename='sovereign'>
        <Switch>
          {isLoggedIn && 
            <>
              <Route path="/" exact><Redirect to="/followingFeed" /></Route>
              <Route path="/singleFeed/:id" component={SingleFeed} />
              <Route path="/singleProfile/:id" component={SingleProfile} />
              <Route path="/followingFeed" component={FollowingFeed} />
              <Route path="/followingProfiles" component={FollowingProfile} />
              <Route path="/splitScreen/:id" component={SplitScreen} />
              <Route path="/settings" component={Settings} />
            </>
          }
          {!isLoggedIn && 
            <Route path="/" component={Login}/>
          }
        </Switch>
      </BrowserRouter>
    </ApiContext.Provider>
  )

}

export default App