import ArrowBackIcon from '../media/back.png';
import {useHistory} from 'react-router-dom';

const BackArrow = ({path}) => {

    const history = useHistory();

    
    const onBackArrowClick = (e) => { 
        e.preventDefault()
        history.push(path);
    }
    
    return (
        <img src={ArrowBackIcon} height='50px' onClick={onBackArrowClick}/>
    )
}

export default BackArrow
