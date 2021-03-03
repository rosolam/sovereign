import { Link } from "react-router-dom"
import IpfsSettings from "../components/IpfsSettings"
import Header from "../components/Header"

const Settings = () => {
    
    const headerBack = '/following/'
    const headerLabel = 'Settings'
    const headerNavs = null
    
    return (
        <>
            <Header back={headerBack} label={headerLabel} navs={headerNavs}/> 
            <IpfsSettings/>
        </>
    )
}

export default Settings
