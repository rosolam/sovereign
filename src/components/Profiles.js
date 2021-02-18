import Profile from './Profile'
import React, { Component } from 'react';

class Profiles extends React.Component{

    constructor(props){
        super(props);
        this.gunAppRoot = props.gunAppRoot
        
        this.state = { 
            profiles: []
        }

    }

    componentDidMount(){
 
        //handle updates to my own profile
        this.gunAppRoot.get('profile').on((value, key, _msg, _ev) => this.handleProfileUpdate(value, key, _msg, _ev))

        //handle updates to the profiles of the users I follow
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('profile').on((value, key, _msg, _ev) => this.handleProfileUpdate(value, key, _msg, _ev))      

      }

    componentWillUnmount(){

        console.log('dropping profile event handler')

        this.gunAppRoot.get('profile').map().off()
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('profile').map().off()

    }

    handleProfileUpdate(value, key, _msg, _ev){

        console.log('profile update event', value,key)

        //check to see if profile exists already
        const existingProfileIndex = this.state.profiles.findIndex(p => p.key === key)
        //console.log('exsting index', existingProfileIndex)
        if(existingProfileIndex == -1){

            //new, add profile item to state
            //console.log('adding profile')
            const newProfile = value
            newProfile.key = key

            //sort the new profile into the array
            this.setState(prevState => ({profiles: [...prevState.profiles,newProfile].sort((a,b) => {return b.created - a.created})}))

        } else {

            //yes, a profile with this id exists...
            //console.log('existing profile')

            //is this an update to delete it?
            if(!value){

                //yes, delete it
                console.log('deleting profile')
                this.setState(prevState => ({profiles: prevState.profiles.filter(p => p.key !== key)}))
                
            } else {

                //No, has it changed?
                const existingProfile = this.state.profiles[existingProfileIndex]
                if(value.modified > existingProfile.modified){

                    //yes, update it
                    console.log('updating profile')
                    const updatedProfile = value
                    updatedProfile.key = key
                    this.setState(prevState => ({profiles: [...prevState.profiles.filter(p => p.key !== key),
                        updatedProfile].sort((a,b) => {return b.created - a.created})}))

                } else {
                    
                    //dupe, ignore this event
                    console.log('ignoring profile')

                }
            }

        }

    }
    
    render() {
        return (
            <div>
                {this.state.profiles.map((profile) => (
                    <Profile profile={profile} key={profile.key}/>
                ))}
            </div>
        );
    }
} 

export default Profiles