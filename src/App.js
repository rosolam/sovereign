import React, { useState, useEffect, useContext} from 'react'
import { BrowserRouter, HashRouter, Redirect, Route, Switch} from 'react-router-dom'
import ApiContext from "./api/ApiContext"
import './App.css'
import Login from './pages/Login'
import Following from './pages/Following'
import Settings from './pages/Settings'
import Feed from './pages/Feed'


const App = () => {

  const [isLoggedIn, setLoggedIn] = useState(false)
  const apiContext = useContext(ApiContext)
  const eventUnSubs = []

  useEffect(() => {

    apiContext.businessLogic.subscribeLogin(setLoggedIn, eventUnSubs)
    apiContext.businessLogic.login(null, null, true)
    window.bl = apiContext.businessLogic
 
    return () => {

      eventUnSubs.forEach(u => u.off())

    };

  }, []);

  return (
      <HashRouter>
        <Switch>
          {isLoggedIn && 
            <>
              <Route path="/" exact><Redirect to="/following" /></Route>
              <Route path="/following" component={Following} />
              <Route path="/feed/:soul" component={Feed} />
              <Route path="/settings/:setting" component={Settings} />
              <Route path="/login"><Redirect to="/following" /></Route>
              {/* <Route path="*"><Redirect to="/following" /></Route> <-- breaks continuing to originally requested path after logging in */}
            </>
          }
          {!isLoggedIn && 
            <Route path="*" component={Login}/>
          }
        </Switch>
      </HashRouter>
  )

}

export default App