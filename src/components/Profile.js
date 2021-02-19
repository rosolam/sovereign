const Profile = ({profile}) => {
   
    return (
        <div>
            profile key: {profile.key}
            profile picture: {profile.picture}
            profile name: {profile.name}
        </div>
    )
}

export default Profile