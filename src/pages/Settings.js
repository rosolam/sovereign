import IpfsSettings from "../components/IpfsSettings"
import UrlPreviewSettings from "../components/UrlPreviewSettings"
import Header from "../components/Header"
import {Nav} from 'react-bootstrap'
import { useState, useEffect} from 'react'
import { Link, useHistory } from 'react-router-dom';
import {useParams} from 'react-router-dom';

const Settings = () => {
    
    const { setting } = useParams();
    
    const [settingComponent, setSettingComponent] = useState()
    const [settingSubLabel, setSettingSubLabel] = useState('Basic Settings')

    const headerNavs = [
        <Nav.Link as={Link} key='0' to="/settings/basic">Basic Settings</Nav.Link>,
        <Nav.Link as={Link} key='1' to="/settings/upload">Enable Uploads</Nav.Link>,
        <Nav.Link as={Link} key='2' to="/settings/preview">Enable Previews</Nav.Link>
    ]
    
    useEffect(() => {
        //update setting based on param in URL
        switch (setting) {
            case 'upload':
                updateSetting(<IpfsSettings/>, 'Upload Settings')
                break;
            case 'preview':
                updateSetting(<UrlPreviewSettings/>, 'Link Preview Settings')
                break;
            default:
                updateSetting(null, 'Basic Settings')
                break;
        }
    }, [setting]);

    const updateSetting = (component, subLabel) => {
        //update setting
        setSettingComponent(component)
        setSettingSubLabel(subLabel)
    }

    return (
        <>
            <Header showBack='true' label='Settings' subLabel={settingSubLabel} navs={headerNavs}/>
            {settingComponent}
            {!settingComponent &&
                <div className='m-3'>
                    <p>This application is special because <b>you</b> own your data and <b>you</b> are the one hosting the application!</p>
                    <p>You can leave it as is, but you have the ability to improve your own functionality by taking advantage of some optional services.</p>
                    <p>Check out <Link to="/settings/upload">Enable Uploads</Link> and <Link to="/settings/preview">Enable Link Previews</Link> in settings to learn more!</p>
                </div>
            }
        </>
    )
}

export default Settings
