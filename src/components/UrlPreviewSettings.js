import React from 'react'
import { Button, Form, Tabs, Tab, Spinner } from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'
import { Link} from 'react-router-dom';

const UrlPreviewSettings = () => {

    const apiContext = useContext(ApiContext)
    const [apiKey, setApiKey] = useState()
    const [apiStatus, setApiStatus] = useState('')

    const handleSubmit = async (e) => {
        
        e.preventDefault()
        
        setApiStatus('test')

        await apiContext.businessLogic.setSetting('linkPreviewNetApiKey',apiKey)
        const connectResult = await apiContext.businessLogic.enableLinkPreview('linkpreview.net')

        if(connectResult){
            setApiStatus('ok')
        }else{
            setApiStatus('bad')
        }

    } 
    
    return (
        <div>
            <div className='m-3'>

                <Tabs defaultActiveKey="about">

                    <Tab eventKey="about" title="What is this?" className="border border-top-0 p-3 scrolling-wrapper" style={{ height: '75vh' }}  >
                        <div className='scrolling-content m-1' >
                            <br/><p><b>TLDR; To have the links you posts show a preview of the page you are sharing please create a free acccount on <a href='https://linkpreview.net' target='_new'>Link Preview</a> and enter your API Key on the next tab.</b></p>
                            <hr></hr>
                            <p className='small'>When you post a link to a webpage your followers will only see a blue underlined link;  It's much nicer when they see a preview of the place your are sending them!</p>
                            <p className='small'>Unfortunately this is a distributed application that runs in your browser and your browser has security limitations that prevent generating previews of other websites :(</p>
                            <p className='small'>Luckily there are a number of services available that have free usage up to normal user limits, like <a href='https://linkpreview.net' target='_new'>Link Preview</a> which allow 60 previews per hour.</p>
                            <p className='small'>Sign up for a free account with them and enter the API Key on the next tab to enable previews for others on the posts you upload.</p>
                        </div>
                    </Tab>
                    <Tab eventKey="LinkPreview" title="Link Preview Keys" className="border border-top-0 p-3">
                        <Form.Group controlId="formLinkPreviewKey">
                            <Form.Label>API Key</Form.Label>
                            <Form.Control type="text" placeholder="a3kfowe9023mdopqqcv923msadl32r3f" value={apiKey} onChange={(e) => setApiKey(e.target.value)}/>
                        </Form.Group>
                        
                        {apiStatus == 'ok' && <>
                            <div className='d-flex justify-content-center'><p>Test Successful! Enjoy link previews :)</p></div>
                            <Button variant="primary" as={Link} to="/following" type="submit" className='m-1 d-block w-100' >Home</Button>
                        </>}
                        {apiStatus == 'bad' && <div className='d-flex justify-content-center'><p>Test Failed, double check your API key</p></div>}

                        {apiStatus == 'test' && 
                            <Button variant="primary" disabled type="submit" className='m-1 d-block w-100'>  
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='mr-3'/>
                                Testing...
                            </Button>
                        }
                        {(!apiStatus || apiStatus == 'bad') &&
                            <Button variant="primary" type="submit" className='m-1 d-block w-100' onClick={handleSubmit}>Test</Button>
                        }
                    </Tab>

                </Tabs>

            </div>
        </div>
    )
}

export default UrlPreviewSettings
