import { BsArrowLeft } from "react-icons/bs"
import {useHistory} from 'react-router-dom';

const BackArrow = (props) => {

    const history = useHistory();

    
    const onBackArrowClick = (e) => { 
        e.preventDefault()
        history.push(props.path);
    }
    
    return (
        <BsArrowLeft  style={{height:props.size || '50px',width:props.size || '50px'}}  onClick={onBackArrowClick}/>
    )
}

export default BackArrow
