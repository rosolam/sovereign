import Gun from 'gun'
import SEA from 'gun/sea'

class BusinessLogic {
    
    isLoggedIn = false;
    gun;
    gunUser;
    gunAppRoot;
    mySoul;
    #eventUnSubs = [];

    constructor(peer){
        
        this.gun = Gun(peer ? peer : "http://192.168.1.99:8080/gun")
        
        this.gunUser = this.gun.user()
        
        console.log('constructed')

    }
    
    dispose(){
        this.#eventUnSubs.forEach(u => u.off())
    }

    createUser(user, password, name){

        console.log('create user request')

        //create
        this.gunUser.create(user, password, (ack) => {

            this.gunAppRoot.get('profile').put({
                name: name,
                picture: '',
                following: '',
                posts: ''
            })

        })

    }

    subscribeLogin(setLoggedIn, unSubs){

        unSubs = unSubs ? unSubs : []
        this.gun.on('auth', async (ack) => {
            
            console.log('login event', ack)
            this.isLoggedIn = true
            this.gunAppRoot = this.gunUser.get('sovereign')
            this.mySoul = this.gunUser['_'].soul
            //if(!unSubs.includes(_ev)){unSubs.push(_ev)}
            setLoggedIn(true)

        })
        
    }

    login(user, password, recall){

        console.log('login request')
        
        //recall
        if(recall){
            this.gunUser.recall({sessionStorage: true})
        } else {
            this.gunUser.auth(user, password)
        }

    }

    getTimeElapsed(time){
        
        const now = new Date().getTime()
        const diff = now - time

        if(diff < 60000){
            return 'just now'
        }else if(diff < 3600000){
            return Math.round(diff/60000) + 'mins'
        }else if(diff < 86400000){
            return Math.round(diff/3600000) + 'hrs'
        }else if(diff < 604800000){
            return Math.round(diff/86400000) + 'days'
        }else if(diff < 2629743831.225){
            return Math.round(diff/604800000) + 'wks'
        }else if(diff < 31556925974.7){
            return Math.round(diff/2629743831.225) + 'mos'
        }else {
            return 'long ago'
        }
    }

    async subscribeTimeElapsed(time, setElapsed, unSubs){

        unSubs = unSubs ? unSubs : []

        const intervalId = setInterval(setElapsed(this.getTimeElapsed(time)),120000)
        
        const unSub = {}
        unSub.off = () => {clearInterval(intervalId)}
        unSubs.push(unSub)

    }

    //* Utility function to parse user from a soul
    parseUserFromSoul(soul){

        if(!soul){return}
        var patt = /^~[^/]*/;
        var result = soul.match(patt);
        if(result.length == 0){return}
        return result[0]
    }
    
    //* Utility function to parse content id from a soul
    parseIDFromSoul(soul){
      
        if(!soul){return}
        var patt = /[^/]*$/;
        var result = soul.match(patt);
        if(result.length == 0){return}
        return result[0]
      
    }

    isMine(soul){
        return this.parseUserFromSoul(soul) == this.gunUser['_'].soul
    }

    getMaxTimeStampOfNode(value){

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
                if (this.getMaxTimeStampOfNode(value) > this.getMaxTimeStampOfNode(existingItem)) {

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
        const id = this.parseIDFromSoul(soul)
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

    async subscribePosts(setPosts, soul, unSubs){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

        //single user or following (plus self)?
        if(soul){

            //handle updates to the posts of a single users
            this.gun.get(soul).get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )  

        }else{

            //handle my own posts
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )       
            
            //handle updates to the posts of the users I follow
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )                

        }
    }

    async subscribeProfiles(setProfiles, unSubs){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

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
        unSubs = unSubs ? unSubs : []
        
        //get profile
        if(setProfile){
            this.gun.get(soul).get('sovereign').get('profile').on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setProfile({...value})
                    console.log('set profile event')
                }
            )
        }

        //get following
        if(!this.isMine(soul) && setFollowing){
            this.gunAppRoot.get('following').get(soul).on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setFollowing(value) 
                }
            )   
        }

        //get last post
        if(setLastPost){
            this.gun.get(soul).get('sovereign').get('profile').get('lastPost').on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    setLastPost(value)
                }
            )
        }

    }

    async subscribePost(soul, setPost, setAttachments, setProfile, unSubs){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

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
        this.gun.get(this.parseUserFromSoul(soul)).get('sovereign').get('profile').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setProfile(value)
            }
        )

    }

}
export default BusinessLogic