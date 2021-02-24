import {Button, Form, Tabs, Tab, ProgressBar} from 'react-bootstrap'
import {Link, useHistory} from 'react-router-dom';
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'
import zxcvbn from 'zxcvbn'


const Login = () => {
    
    const apiContext = useContext(ApiContext)
    const history = useHistory();
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
     
    const passwordStrength = zxcvbn(password)

    const handleLogin = (e) => {
        
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

    const handleCreate = (e) => {
        
        e.preventDefault()
        
        //TODO validation
        if(!username || !password){
            alert('oops!')
            return
        }
        
        //create
        console.log(apiContext)
        apiContext.businessLogic.createUser(username,password,name)

        //redirect to home
        history.push('/')
    
    } 

    return (
        <div className='m-3'>

            <Tabs defaultActiveKey="login" id="uncontrolled-tab-example">

                <Tab eventKey="login" title="Log In" className="border border-top-0 p-3">
                    <Form.Group controlId="formLoginUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="username here" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formLoginPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="password here" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" type="submit" className='m-1 d-block w-100' onClick={handleLogin}>Login</Button>
                </Tab>

                <Tab eventKey="createAccount" title="Create Account" className="border border-top-0 p-3">
                    <Form.Group controlId="formCreateName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
                        <Form.Text className="text-muted">
                            This is how other users will see you online; You can change this later.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formCreateUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="smithj42" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Form.Text className="text-muted">
                            This is is your user name to login, this cannot be changed.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formCreatePassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="strong password here" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Form.Text>
                            <ProgressBar animated label={passwordStrength.score == 4 ? 'strong' : 'weak'} min={password ? -1 : 0} max="4" variant={passwordStrength.score == 4 ? 'success' : 'danger'} now={passwordStrength.score} />
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formCreateConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" placeholder="strong password here again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formCreateCheckbox1">
                        <Form.Check type="checkbox" label="I understand that there is no way to recover a lost password" />
                     </Form.Group>
                     <Form.Group controlId="formCreateCheckbox2">
                        <Form.Check type="checkbox" label="I understand that words have power and that freedom comes with the price of accountability and tolerance" />
                     </Form.Group>
                    <Button variant="primary" type="submit" className='m-1 d-block w-100' onClick={handleCreate}>Create Account</Button>
                </Tab>

                <Tab eventKey="about" title="About" className="border border-top-0 p-3">

                    What the heck is this all about?!

                </Tab>

            </Tabs>

        </div>
    )
}

export default Login
