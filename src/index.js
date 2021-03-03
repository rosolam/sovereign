import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import ApiContext from "./api/ApiContext"
import BusinessLogic from './api/BusinessLogic'

ReactDOM.render(
  <React.StrictMode>
    <div className="screen-wrapper">
    <ApiContext.Provider value={{businessLogic: new BusinessLogic()}}>
    <App/>
    </ApiContext.Provider>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
