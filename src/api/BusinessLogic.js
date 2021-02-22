class BusinessLogic {
    gunAppRoot
    constructor(gun, gunUser){
        this.gun = gun;
        this.gunUser = gunUser;
    }  

    //* Utility function to parse user from a soul
    static parseUserFromSoul(soul){

        if(!soul){return}
        var patt = /^~[^/]*/;
        var result = soul.match(patt);
        if(result.length == 0){return}
        return result[0]
    }
    
    //* Utility function to parse content id from a soul
    static parseIDFromSoul(soul){
      
        if(!soul){return}
        var patt = /[^/]*$/;
        var result = soul.match(patt);
        if(result.length == 0){return}
        return result[0]
      
    }

    isMine(soul){
        return BusinessLogic.parseUserFromSoul(soul) == this.gunUser['_'].soul
    }

    static getMaxTimeStampOfNode(value){

        //get max timestamp of properties (being careful to avoid prototype and any possible non numerics that could somehow be picked up)
        let maxTimeStamp = 0
        for (const prop in value['_']['>']){
            if(value.hasOwnProperty(prop) && !isNaN(value[prop])){
                maxTimeStamp = Math.max(maxTimeStamp,value[prop])
            }
        }
        return maxTimeStamp

    }

    manageArrayState(prevState, value, key, sortBy){

        //check to see if item exists already
        const existingIndex = prevState.findIndex(p => p.key === key)
        //console.log('existing index', existingIndex)
        if (existingIndex == -1 && value) {

            //new, add item item to state
            //console.log('adding item')
            const newItem = value
            newItem.key = key

            //sort the new item into the array
            return [...prevState, newItem].sort((a, b) => { return b[sortBy] - a[sortBy] })

        } else {

            //yes, a item with this id exists...
            //console.log('existing item')

            //is this an update to delete it?
            if (!value) {

                //yes, delete it
                console.log('deleting item')
                return prevState.filter(p => p.key !== key)

            } else {

                //No, has it changed?
                const existingItem = prevState[existingIndex]
                if (BusinessLogic.getMaxTimeStampOfNode(value) > BusinessLogic.getMaxTimeStampOfNode(existingItem)) {

                    //yes, update it
                    //console.log('updating item')
                    const updatedItem = value
                    updatedItem.key = key
                    return ([...prevState.filter(p => p.key !== key),updatedItem].sort((a, b) => {  return b[sortBy] - a[sortBy] }))

                } else {

                    //dupe, ignore this event
                    //console.log('ignoring item')
                    return prevState

                }
            }

   }


    }

    async followUser(soul){
        
        //ensure soul is just for the user
        soul = this.parseUserFromSoul(soul)

        //get user referecne
        const userRef = this.gun.get(soul)

        //follow user
        this.gunAppRoot.get('following').get(soul).put({ trusted: false, mute: false }).get('user').put(userRef);
        
    }

    async createPost(post){
        
        //create new post
        const created = new Date().getTime()
        this.gunAppRoot.get('posts').set({
            text: post.text,
            created: created,
            modified: created
        })

    }

    async deletePost(soul){
        
        const id = BusinessLogic.parseIDFromSoul(soul)
        this.gunAppRoot.get('posts').get(id).put(null)

    }

    async getProfile(soul, cb){

        //if no soul provided assume user's soul
        if(!soul){

            //return users profile
            return this.gunUser.get('sovereign').get('profile').once(cb)

        } else {

            //ensure soul is just for the user
            soul = this.parseUserFromSoul(soul)

            //get profile reference
            return this.gun.get(soul).get('sovereign').get('profile').once(cb)

        }

    }

    async updateProfile(profile){

        //update profile
        return this.gunUser.get('sovereign').get('profile').put(profile)

    }

    async subscribePosts(setPosts, unSub, options){
            
        //handle updates for a single user
        //apiContext.gun.get(singleUser).get('sovereign').get('posts').map().on((value, key, _msg, _ev) => handlePostUpdate(value, key, _msg, _ev))

        //handle updates to the posts of the users I follow
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
            (value, key, _msg, _ev) =>  {
                if(unSub){ unSub = _ev}

                setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
            }
        )                

    }

    async subscribeProfiles(setProfiles, unSub){

        //handle updates to the profiles of the users I follow
        this.gunAppRoot.get('following').map().on(
            async (value, key, _msg, _ev) => {
                if(unSub){ unSub = _ev}

                //add value to sort on
                value.sort = await this.gunAppRoot.get('following').get(key).get('user').get('sovereign').get('profile').get('name').then()
                
                setProfiles(prevState => this.manageArrayState(prevState, value, key, 'sort'))
            }
        )

    }

    async subscribeProfile(cb){

    }

    async getPost(soul, setPost, setAttachments, setProfile){

        //call sequential

        //get post
        this.gun.get(soul).once(setPost)
        
        //get attachments
        this.gun.get(soul).get('attachments').once().map().once(
            (value, key, _msg, _ev) => {
                setAttachments(prevState => this.manageArrayState(prevState, value, key, 'key'))
            }
        )

        //get profile of the poster
        this.gun.get(BusinessLogic.parseUserFromSoul(soul)).get('sovereign').get('profile').once(setProfile)

    }

}
export default BusinessLogic