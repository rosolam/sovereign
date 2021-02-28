import React, { useState, useEffect, useContext} from 'react'
import { BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import ApiContext from "./api/ApiContext"
import './App.css'
import Login from './pages/Login'
import Following from './pages/Following'
import Settings from './pages/Settings'
import Feed from './pages/Feed'


const App = ({baseUrl}) => {

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
      <BrowserRouter basename={baseUrl + '/sovereign'}>
        <Switch>
          {isLoggedIn && 
            <>
              <Route path="/" exact><Redirect to="/following" /></Route>
              <Route path="/following" component={Following} />
              <Route path="/feed/:soul" component={Feed} />
              <Route path="/settings" component={Settings} />
              <Route path="*"><Redirect to="/following" /></Route>
            </>
          }
          {!isLoggedIn && 
            <Route path="*" component={Login}/>
          }
        </Switch>
      </BrowserRouter>
  )

}

export default App