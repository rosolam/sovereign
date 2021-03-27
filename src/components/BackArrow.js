import { BsArrowLeft } from "react-icons/bs"
import {useHistory} from 'react-router-dom';

const BackArrow = (props) => {

    const history = useHistory();

    
    const onBackArrowClick = (e) => { 
        e.preventDefault()

        //if an explicit path was provided to go back to use it otherwise go home or use history to go back
        if(props.path){
            //go to path indicated
            history.push(props.path);
        } else {

            if(props.useHistory){
                //go back in browser history
                history.goBack();
            } else {
                //go home
                history.push('/');
            }
        }
    }
    
    return (
        <BsArrowLeft  style={{height:props.size || '50px',width:props.size || '50px'}}  onClick={onBackArrowClick}/>
    )
}

export default BackArrow
