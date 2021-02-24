import {Button, Form} from 'react-bootstrap'
import {Link, useHistory} from 'react-router-dom';
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'


const Login = (onLogin) => {
    
    const apiContext = useContext(ApiContext)
    const history = useHistory();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
     
    const handleSubmit = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!username || !password){
            alert('oops!')
            return
        }
        
        //login
        console.log(apiContext)
        apiContext.businessLogic.login(username,password,false)

        //redirect to home
        history.push('/')
    
    } 

    return (
        <div className='m-3'>
            <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="username here" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="password here" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="secondary" onClick>Close</Button>
            <Button variant="primary" type="submit" onClick={handleSubmit}>Login</Button>
        </div>
    )
}

export default Login
