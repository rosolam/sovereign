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
        if (existingIndex == -1 && !value){
            //deleting something that isn't on the list, ignore it
            return prevState
        }

        if (existingIndex == -1) {

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
        this.gunAppRoot.get('following').get(soul).put({ 
            trusted: false, 
            mute: false,
            key: soul
        }).get('user').put(userRef);
        
    }

    async createPost(post){
        
        //create new post
        const created = new Date().getTime()
        const key = created + '_' + this.gunUser['_'].soul
        this.gunAppRoot.get('posts').get(key).put({
            text: post.text,
            created: created,
            modified: created,
            key: key
        }).once(async (data) => {
            const postRef = this.gunAppRoot.get('posts').get(key)
            this.gunAppRoot.get('profile').get('lastPost').put(postRef)
        })

        //this.gunAppRoot.get('profile').get('lastPost').put(key)
 
    }

    async deletePost(soul){
        
        //need to update last post in profile?
        const lastPostKey = await this.gunAppRoot.get('profile').get('lastPost').then()
        const deletedPostKey = await this.gun.get(soul).get('key').then()
        if(lastPostKey && lastPostKey == deletedPostKey){
            this.gunAppRoot.get('profile').get('lastPost').put(false)
        }
        
        //delete
        //this.gun.get(soul).put(null)
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

    async subscribePosts(setPosts, unSubs, options){
            
        //handle updates for a single user
        //apiContext.gun.get(singleUser).get('sovereign').get('posts').map().on((value, key, _msg, _ev) => handlePostUpdate(value, key, _msg, _ev))

        //track events to unsub
        unSubs = []

        //handle updates to the posts of the users I follow
        this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
            (value, key, _msg, _ev) =>  {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
            }
        )                

    }

    async subscribeProfiles(setProfiles, unSubs){

        //track events to unsub
        unSubs = []

        //handle updates to the profiles of the users I follow
        this.gunAppRoot.get('following').map().on(
            async (value, key, _msg, _ev) => {
                
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                
                //add a value to sort on
                if(value){
                    value.sort = await this.gunAppRoot.get('following').get(key).get('user').get('sovereign').get('profile').get('lastPost').get('created').then()
                }
                
                setProfiles(prevState => this.manageArrayState(prevState, value, key, 'sort'))
            }
        )

    }

    async subscribeProfile(soul, setProfile, setFollowing, setLastPost, unSubs){

        //track events to unsub
        unSubs = []

        //get profile
        this.gun.get(soul).on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setProfile(value)
            }
        )

        //get following
        this.gunAppRoot.get('following').get(BusinessLogic.parseUserFromSoul(soul)).on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setFollowing(value)
            }
        )   

        //get last post
        this.gun.get(soul).get('lastPost').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setLastPost(value)
            }
        )

    }

    async subscribePost(soul, setPost, setAttachments, setProfile, unSubs){

        //track events to unsub
        unSubs = []

        //get post
        this.gun.get(soul).on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setPost(value)
            }
        )
        
        //get attachments
        this.gun.get(soul).get('attachments').map().on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setAttachments(prevState => this.manageArrayState(prevState, value, key, 'key'))
            }
        )

        //get profile of the poster
        this.gun.get(BusinessLogic.parseUserFromSoul(soul)).get('sovereign').get('profile').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setProfile(value)
            }
        )

    }

}
export default BusinessLogic