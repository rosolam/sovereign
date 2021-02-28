import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {useHistory} from 'react-router-dom';

const BackArrow = ({path}) => {

    const history = useHistory();

    
    const onBackArrowClick = (e) => { 
        e.preventDefault()
        history.push(path);
    }
    
    return (
        <ArrowBackIcon style={{fontSize:'30px', height:'50px'}} onClick={onBackArrowClick}/>
    )
}

export default BackArrow
