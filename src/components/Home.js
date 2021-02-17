import { Link } from "react-router-dom"

const Home = (props) => {

    return (
    
        <div>
            <Link to="/test">test</Link>
            {props.header}
            {props.followModal}
            {props.newPostModal}
            {props.profiles}
            {props.posts}
        </div>
    )
}

export default Home
