import Gun from 'gun'
import SEA from 'gun/sea'
import IpfsProviderLocalNode from './IpfsProviders/IpfsProviderLocalNode'
import IpfsProviderGateway from './IpfsProviders/IpfsProviderGateway'
import IpfsProviderPinata from './IpfsProviders/IpfsProviderPinata'
import PreviewProviderLinkPreview from './PreviewProviders/PreviewProviderLinkPreview'
import PreviewProviderNone from './PreviewProviders/PreviewProviderNone'
import crypto from 'crypto'

class BusinessLogic {
    
    isLoggedIn = false;
    gun;
    gunUser;
    gunAppRoot;
    mySoul;
    ipfsProvider;
    linkPreviewProvider;
    #eventUnSubs = [];
    #setLoggedIn
    #newUser = false;
    userEncPair;

    constructor(gunPeer){

        if (typeof Gun.SEA === 'undefined') {
            console.log('setting SEA reference')
            Gun.SEA = SEA;
        }
        this.gun = Gun(gunPeer ? gunPeer : "https://dev.rosolalaboratories.com:4000/gun")
        this.gunUser = this.gun.user()

        //setup default ipfs gateway provider while we attempt to use local ipfs node
        this.enableIpfs('gateway')
        this.enableIpfs('local')

        //setup default link preview provider
        this.enableLinkPreview('none')

        console.log('business logic constructed')

    }
    
    dispose(){
        this.#eventUnSubs.forEach(u => u.off())
    }

    async getSetting(name){
        
        const encValue = await this.gunAppRoot.get('settings').get(name).then()
        return await SEA.decrypt(encValue, this.userEncPair)
    }

    async setSetting(name, value){

        const encValue = await SEA.encrypt(value, this.userEncPair)
        return await this.gunAppRoot.get('settings').get(name).put(encValue).then()
    }

    async enableIpfs(provider){

        let ipfs
        let result

        switch (provider) {
            case 'local':
                console.log('attemping to connect to local IPFS node')
                ipfs = new IpfsProviderLocalNode()
                result = await ipfs.connect()
                break;
            
            case 'pinata':
            
                console.log('attemping to connect to local IPFS node')
                //get keys
                const pinataApiKey = await this.getSetting('pinataApiKey')
                const pinataApiSecret = await this.getSetting('pinataApiSecret')

                //keys exist?
                if(!pinataApiKey || !pinataApiSecret){
                    console.log('no pinata keys found')
                    return false
                }

                //connect
                ipfs = new IpfsProviderPinata()
                result = await ipfs.connect({
                    pinataApiKey: pinataApiKey,
                    pinataSecretApiKey: pinataApiSecret
                })

                break;
                
            default:
                
                //default gateway
                console.log('connecting to default gateway IPFS provider')
                ipfs = new IpfsProviderGateway()
                result = await ipfs.connect()
                break;
        }
                        
        //change to this provider if connected
        if(result.connect){
            console.log('connected to ipfs provider:', ipfs.name)    
            this.ipfsProvider = ipfs
            return true
        } else {
            console.log('could not connect to ipfs provider:', ipfs.name)    
            return false
        }

    }

    async enableLinkPreview(provider){

        let preview;
        let result;
        switch (provider) {
            case 'linkpreview.net':
                console.log('attemping to connect to linkpreview.net')
                //get keys
                const apiKey = await this.getSetting('linkPreviewNetApiKey')
                
                //keys exist?
                if(!apiKey){
                    console.log('no api keys found')
                    return false
                }

                //connect
                preview = new PreviewProviderLinkPreview()
                result = await preview.connect({
                    apiKey: apiKey
                })
                break;
        
            default:
                //default (no preview) provider
                preview = new PreviewProviderNone()
                result = await preview.connect()
                break;
        }

        //change to this provider if connected
        if(result.connect){
            console.log('connected to preview provider:', preview.name)    
            this.linkPreviewProvider = preview
            return true
        } else {
            console.log('could not connect to preview provider:', preview.name)       
            return false
        }

    }

    async createUser(user, password, name){

        console.log('create user request')

        //create
        this.gunUser.create(user, password, (ack) => {

            //cache the new user data to create during the login auth even because we can't write to the user node at this point yet
            this.#newUser = {name: name}

            //call to log them in
            this.login(user,password)

        })

    }

    subscribeLogin(setLoggedIn, unSubs){

        this.#setLoggedIn = setLoggedIn
        unSubs = unSubs ? unSubs : []
        this.gun.on('auth', async (ack) => {
            
            console.log('login event', ack)

            //finish creating a new user if a new user object exists
            if(this.#newUser){
                this.gunUser.get('sovereign').get('profile').put(this.#newUser)          
                this.#newUser = false //wipe the new user so we don't run this again
            }

            //capture their logged in info
            this.isLoggedIn = true
            this.gunAppRoot = this.gunUser.get('sovereign')
            this.mySoul = this.gunUser['_'].soul
            this.userEncPair = ack.sea
            
            //if we aren't connected to a local node, let's try to connect to pinata now
            if(!this.ipfsProvider.canPut){ await this.enableIpfs('pinata')} //await it to help ensure we connect before re-rendering

            //if we aren't connected to a preview provider let's try to connect to linkpreview.net
            if(!this.ipfsProvider.canPreview){ await this.enableLinkPreview('linkpreview.net')} //await it to help ensure we connect before re-rendering
                        
            //call back to app to set state of logged in
            this.#setLoggedIn(true)

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

    logout(){

        console.log('logout request')
        this.gunUser.leave()
        this.isLoggedIn = false
        this.#setLoggedIn(false)
        
    }

    getTimeElapsed(time){
        
        const now = new Date().getTime()
        const diff = now - time

        if(diff < 60000){
            return 'just now'
        }else if(diff < 3600000){
            return Math.round(diff/60000) + ' mins'
        }else if(diff < 86400000){
            return Math.round(diff/3600000) + ' hrs'
        }else if(diff < 604800000){
            return Math.round(diff/86400000) + ' days'
        }else if(diff < 2629743831.225){
            return Math.round(diff/604800000) + ' wks'
        }else if(diff < 31556925974.7){
            return Math.round(diff/2629743831.225) + ' mos'
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
        return this.parseUserFromSoul(soul) == this.mySoul
    }

    getMaxTimeStampOfNode(value){

        if (!value || !value['_'] || !value['_']['>']){ return 0}

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
            const newItem = {...value}
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
                    const updatedItem = {...value}
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

    async createPost(post, attachments){
        
        //create new post
        const created = new Date().getTime()
        const key = crypto.randomBytes(20).toString('hex')
        this.gunAppRoot.get('posts').get(key).put({
            text: post.text,
            created: created,
            modified: created,
            key: key
        }).once(async (data) => {
            
            //get the post and add ref to profile as last post
            const postRef = this.gunAppRoot.get('posts').get(key)
            this.gunAppRoot.get('profile').get('lastPost').put(postRef)

            //add attachments
            if(attachments && attachments.length){
                attachments.forEach(async attachment => {

                    //what type of attachment?
                    let attachmentNode = {}
                    if(attachment.type == 'url'){
                        attachmentNode = {...attachment}
                    }else if(attachment.type.startsWith('image/')){
                        attachmentNode = {
                            key: attachment.key,
                            type: 'image',
                            ipfsHash: await this.ipfsProvider.putFile(attachment)
                        }
                    }else {
                        attachmentNode = {
                            key: attachment.key,
                            type: 'file',
                            ipfsHash: await this.ipfsProvider.putFile(attachment)
                        }
                    }
                    
                    //add it to the attachments node
                    postRef.get('attachments').get(attachmentNode.key).put(attachmentNode)

                });
            }

        })

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

    async getPicture(hash){

        const file = await this.ipfsProvider.getFile(hash)
        return file

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

    async updateProfile(profile, picture){

        if(picture){
            profile.picture = await this.ipfsProvider.putFile(picture)
        }

        //update profile
        return this.gunUser.get('sovereign').get('profile').put(profile)
        
    }

    async subscribePosts(setPosts, soul, unSubs, once){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

        //single user or following (plus self)?
        if(soul){

            //handle updates to the posts of a single users
            this.gun.get(soul).get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )  

        }else{

            //handle my own posts
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )       
            
            //handle updates to the posts of the users I follow
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
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

    async subscribeProfile(soul, setProfile, setProfilePic, setFollowing, setLastPost, unSubs, once){

        //default soul to the user's
        soul = soul ? soul : this.mySoul;
console.log(soul)
        //track events to unsub
        unSubs = unSubs ? unSubs : []
        
        //get profile
        if(setProfile){
            this.gun.get(soul).get('sovereign').get('profile').on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setProfile({...value})
                }
            )
        }

        //get profile picture
        if(setProfilePic){
            this.gun.get(soul).get('sovereign').get('profile').get('picture').on(
                async(value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setProfilePic(await this.getPicture(value))
                    console.log('set profile pic event')
                }
            )
        }

        //get following
        if(!this.isMine(soul) && setFollowing){
            this.gunAppRoot.get('following').get(soul).on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setFollowing({...value}) 
                }
            )   
        }

        //get last post
        if(setLastPost){
            this.gun.get(soul).get('sovereign').get('profile').get('lastPost').on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setLastPost({...value})
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
                setPost({...value})
            }
        )
        
        //get attachments
        this.gun.get(soul).get('attachments').map().on(
            async (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
               
                const attachment = {...value}
                if(attachment.type == 'image'){
                    const picUrl = await this.getPicture(attachment.ipfsHash)
                    attachment.url = picUrl
                }
                
                setAttachments(prevState => this.manageArrayState(prevState, attachment, key, 'key'))
            }
        )

        //get profile of the poster
        this.gun.get(this.parseUserFromSoul(soul)).get('sovereign').get('profile').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                setProfile({...value})
            }
        )

    }

    async getPreview(url){
        return this.linkPreviewProvider.getPreview(url)
    }

}
export default BusinessLogic