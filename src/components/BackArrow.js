import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {useHistory} from 'react-router-dom';

export const BackArrow = ({path}) => {

    const history = useHistory();

    
    const onBackArrowClick = (e) => { 
        e.preventDefault()
        history.push(path);
    }
    
    return (
        <div className='d-flex flex-column justify-content-center'><ArrowBackIcon style={{fontSize:'50px'}} onClick={onBackArrowClick}/></div>
    )
}
