import React from 'react'
import { Button, Form, Tabs, Tab, Spinner } from 'react-bootstrap'
import { useState, useEffect, useContext} from 'react'
import ApiContext from '../api/ApiContext'
import { Link} from 'react-router-dom';

const IpfsSettings = () => {

    const apiContext = useContext(ApiContext)
    const [pinataKey, setPinataKey] = useState()
    const [pinataSecret, setPinataSecret] = useState()
    const [pinataStatus, setPinataStatus] = useState('')

    const handleSubmit = async (e) => {
        
        e.preventDefault()
        
        setPinataStatus('test')

        await apiContext.businessLogic.setSetting('pinataApiKey',pinataKey)
        await apiContext.businessLogic.setSetting('pinataApiSecret',pinataSecret)
        const connectResult = await apiContext.businessLogic.enableIpfs('pinata')

        if(connectResult){
            setPinataStatus('ok')
        }else{
            setPinataStatus('bad')
        }

    } 
    
    return (
        <div>
            <div className='m-3'>

                <Tabs defaultActiveKey="about">

                    <Tab eventKey="about" title="What is this?" className="border border-top-0 p-3 scrolling-wrapper" style={{ height: '75vh' }}  >
                        <div className='scrolling-content m-1' >
                            <br/><p><b>TLDR; To upload pictures and files, <a href='https://github.com/ipfs-shipyard/ipfs-desktop' target='_new'>install IPFS</a> on the computer you are browsing from or please create a free acccount on <a href='https://pinata.cloud/' target='_new'>Pinata</a> and enter your API Key on the next tab.</b></p>
                            <hr></hr>
                            <p className='small'>Since this is a distributed application a special method is needed to share files in a secure, distributed and uncesorable manner.  Let me introduce you to the <a href='https://ipfs.io/' target='_new'>Interplanetary File System (IPFS)</a>!</p>
                            <p className='small'>You can use your <b>own</b> IPFS node by <a href='https://github.com/ipfs-shipyard/ipfs-desktop' target='_new'>installing IPFS</a> on the desktop you are using to view this site right now; it will automatically be found and used by Sovereign!</p>
                            <p className='small'>Without your own node, or on a mobile device that isn't conducive to hosting a node, we need someone to add your files into IPFS for you.  Fortunately there are some options, like <a href='https://pinata.cloud/' target='_new'>Pinata</a> that do just this!</p>
                            <p className='small'>Sign up for a free account with them (1gb of storage for free), create an Admin API Key and enter the key codes on the next tab to enable file uploads!</p>
                        </div>
                    </Tab>
                    <Tab eventKey="pinata" title="Pinata Keys" className="border border-top-0 p-3">
                        <Form.Group controlId="formPinataKey">
                            <Form.Label>API Key</Form.Label>
                            <Form.Control type="text" placeholder="0skm437lkl43n4nx21d" value={pinataKey} onChange={(e) => setPinataKey(e.target.value)}/>
                        </Form.Group>
                        <Form.Group controlId="formPinataSecret">
                            <Form.Label>API Secret</Form.Label>
                            <Form.Control as="textarea" rows="3" placeholder="n2q4fop3u1dpom9uomfi3h43opgfpn23mp3fmniop34nigfm23mdomp32fmopfm2" value={pinataSecret} onChange={(e) => setPinataSecret(e.target.value)}/>
                        </Form.Group>
                        
                        {pinataStatus == 'ok' && <>
                            <div className='d-flex justify-content-center'><p>Test Successful! Enjoy uploading files :)</p></div>
                            <Button variant="primary" as={Link} to="/following" type="submit" className='m-1 d-block w-100' >Home</Button>
                        </>}
                        {pinataStatus == 'bad' && <div className='d-flex justify-content-center'><p>Test Failed, double check your API values and ensure the key is an <b>Admin</b> Key</p></div>}

                        {pinataStatus == 'test' && 
                            <Button variant="primary" disabled type="submit" className='m-1 d-block w-100'>  
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className='mr-3'/>
                                Testing...
                            </Button>
                        }
                        {(!pinataStatus || pinataStatus == 'bad') &&
                            <Button variant="primary" type="submit" className='m-1 d-block w-100' onClick={handleSubmit}>Test</Button>
                        }
                    </Tab>

                </Tabs>

            </div>
        </div>
    )
}

export default IpfsSettings
