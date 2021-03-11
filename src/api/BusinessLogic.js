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
    userSEAPair;
    sea;

    constructor(gunPeer){

        if (typeof Gun.SEA === 'undefined') {
            console.log('setting SEA reference')
            Gun.SEA = SEA;
        }
        this.gun = Gun(gunPeer ? gunPeer : "https://dev.rosolalaboratories.com:4000/gun")
        this.gunUser = this.gun.user()

        //for testing
        this.sea = SEA

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
        return await SEA.decrypt(encValue, this.userSEAPair)
    }

    async setSetting(name, value){

        const encValue = await SEA.encrypt(value, this.userSEAPair)
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
            this.userSEAPair = ack.sea
            
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

    parsePubFromSoul(soul){
        return this.parseUserFromSoul(soul).slice(1)
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

    async followUser(userSoul){
        
        //ensure soul is just for the user
        userSoul = this.parseUserFromSoul(userSoul)

        //get user reference
        const userRef = this.gun.get(userSoul)

        //follow user
        this.gunAppRoot.get('following').get(userSoul).put({ 
            trusted: false,
            mute: false,
            key: userSoul,
            pub: this.parsePubFromSoul(userSoul)
        }).get('user').put(userRef);
        
    }

    async encryptOrNot(value, key){
        //returns an encrypted value or if no key, the unencrypted value
        return key ? await SEA.encrypt(value, key) : value;
    }

    async decryptOrNot(value, key){
        //returns an encrypted value or if no key, the unencrypted value
        return key ? await SEA.decrypt(value, key) : value;
    }

    async setUserCommentTrust(userSoul, isTrusted){

        //ensure soul is just for the user
        userSoul = this.parseUserFromSoul(userSoul)

        //update comments cert
        const userPub = this.parsePubFromSoul(userSoul)
        const cert = isTrusted ? await SEA.certify(
            userPub,
            {"*": "sovereign/comments","+":"*"},
            this.userSEAPair,
            null,
            {blacklist: this.gunAppRoot.get('certs').get('comments').get('blacklist')}
        ) : null
        this.gunAppRoot.get('certs').get('comments').get(userSoul).put(cert)

        //update blacklist
        this.gunAppRoot.get('certs').get('comments').get('blacklist').get(userPub).put(!isTrusted)

        //update followed user trust property
        this.gunAppRoot.get('following').get(userSoul).get('trusted').put(isTrusted)

    }

    async setReadPostTrust(postSoul, encryptionKey){

        //add trust for self
        const encryptedKey = await SEA.encrypt(encryptionKey, this.userSEAPair)
        this.gun.get(postSoul).get('trusted').get(this.mySoul).put(encryptedKey)

        //add trust for trusted
        this.gunAppRoot.get('following').map().once(
            async (value, key, _msg, _ev) => {
     
                //if trusted, add key to trust
                if(value && value.trusted){
                    const ePub = await value.userRef.get('epub').then()
                    const encryptedKey = await SEA.encrypt(encryptionKey, ePub)
                    this.gun.get(postSoul).get('trusted').get(key).put(encryptedKey)
                }

            }
        )

        //todo: remove trust for those I no longer trust...

    }

    async createComment(postSoul, text){

        //prepare for encrypting the comment
        const ownerSoul = this.parseUserFromSoul(postSoul)
        const isEncrypted = await this.gun.get(postSoul).get('encrypted').then()
        const encryptedKey = isEncrypted ? await this.gun.get(postSoul).get('trusted').get(ownerSoul).then() : null
        if(isEncrypted && !encryptedKey){ console.log('no encryption key found for the user to comment'); return false}
        const encryptionKey = encryptedKey ? await SEA.decrypt(encryptedKey, this.userSEAPair) : null

        //build comment
        const created = new Date().getTime()
        const commentKey = created + this.mySoul
        const comment = {
            text: this.encryptOrNot(text, encryptionKey),
            created: created,
        } //todo: see if we need to write the author and have them sign it, or if we can parse from the gun object...

        //write the comment
        const postID = this.parseIDFromSoul(postSoul)
        if(this.isMine(postSoul)){
            //write to my user node
            this.gunAppRoot.get('comments').get(postID).get(commentKey).put(comment)
        }else{
            //write to another user's node using cert
            const cert = await this.gun.get(ownerSoul).get('sovereign').get('certs').get('comments').then()  //todo: check to see if the cert includes me
            this.gun.get('ownerSoul').get('sovereign').get('comments').get(postID).get(commentKey).put(comment, cert)
        }

    }

    async createPost(post, attachments, encrypt){

        //create new post
        const encryptionKey = encrypt ? crypto.randomBytes(32).toString('hex') : '' //32 bytes = 256 bit
        const created = new Date().getTime()
        const key = created + this.mySoul
        this.gunAppRoot.get('posts').get(key).put({
            encrypted: !!encrypt,
            text: await this.encryptOrNot(post.text, encryptionKey),
            created: created,
            modified: created,
            key: key
        }).once(async (data) => {
            
            
            //get the post and add ref to profile as last post
            const postRef = this.gunAppRoot.get('posts').get(key)
            this.gunAppRoot.get('profile').get('lastPostTrusted').put(postRef)
            if(!encrypt){this.gunAppRoot.get('profile').get('lastPost').put(postRef)}

            //add decryption keys if encrypted
            if(encrypt){
                this.setReadPostTrust(data['_']['#'], encryptionKey)
            }
            
            //add attachments
            if(attachments && attachments.length){
                attachments.forEach(async attachment => {

                    //what type of attachment?
                    let attachmentNode = {}
                    if(attachment.type == 'url'){
                        attachmentNode = {
                            key: attachment.key,
                            type: 'image',
                            url: await this.encryptOrNot(attachment.url, encryptionKey),
                            title: await this.encryptOrNot(attachment.title, encryptionKey),
                            description: await this.encryptOrNot(attachment.description, encryptionKey),
                            image: await this.encryptOrNot(attachment.image, encryptionKey)
                        }
                    }else if(attachment.type.startsWith('image')){
                        attachmentNode = {
                            key: attachment.key,
                            type: 'image',
                            ipfsHash: await this.ipfsProvider.putFile(attachment) //todo: encrypt file
                        }
                    }else {
                        attachmentNode = {
                            key: attachment.key,
                            type: 'file',
                            ipfsHash: await this.ipfsProvider.putFile(attachment) //todo: encrypt file
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

    async getFileFromIpfs(hash){

        const file = await this.ipfsProvider.getFile(hash)
        return file

    }

    async updateProfile(profile, picture){

        if(picture){
            profile.picture = await this.ipfsProvider.putFile(picture)
        }

        //update profile
        return this.gunUser.get('sovereign').get('profile').put(profile)
        
    }

    async subscribePosts(soul, setPosts, unSubs, once){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

        //local helper function to check for decryption before responding
        const setPostWithDecryptionKey =  async (value, key) => {
            
            //encrypted?
            if(value && value.encrypted){
        
                //encrypted so check to see if this user is trusted and get the decryption key
                const postSoul = Gun.node.soul(value)
                this.gun.get(postSoul).get('trusted').get(this.mySoul).once(
                    async (encryptedKey) =>  {
                        //trusted?
                        if(encryptedKey){                                    
                            //enrich with decryption key and add it
                            const decryptionKey = await SEA.decrypt(encryptedKey, this.userSEAPair);
                            const valueWithDecryptionKey = {...value, decryptionKey: decryptionKey}
                            setPosts(prevState => this.manageArrayState(prevState, valueWithDecryptionKey, key, 'created'))
                        }
                    }
                )

            } else {

                //public post so just add it
                setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))

            }
        }

        //single user or following (plus self)?
        if(soul){

            //handle updates to the posts of a single users
            const userSoul = this.parseUserFromSoul(soul)
            this.gun.get(userSoul).get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPostWithDecryptionKey(value, key)
                }
            )  

        }else{

            //handle my own posts
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPostWithDecryptionKey(value, key)
                }
            )       
            
            //handle updates to the posts of the users I follow
            this.gunAppRoot.get('following').map().get('user').get('sovereign').get('posts').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPostWithDecryptionKey(value, key)
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

    async subscribeProfile(soul, setProfile, unSubs, once){

        //sanitize input
        const userSoul = soul ? this.parseUserFromSoul(soul) : this.mySoul
        unSubs = unSubs ? unSubs : []

        //get profile
        this.gun.get(userSoul).get('sovereign').get('profile').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                setProfile({...value})
            }
        )

    }
    
    async subscribeProfilePic(soul, setProfilePic, unSubs, once){

        //sanitize input
        const userSoul = soul ? this.parseUserFromSoul(soul) : this.mySoul
        unSubs = unSubs ? unSubs : []
        
        //get pic
        this.gun.get(userSoul).get('sovereign').get('profile').get('picture').on(
            async(value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                setProfilePic(await this.getFileFromIpfs(value))
            }
        )
    }

    async subscribeFollowing(soul, setFollowing, unSubs, once){
        
        //right now this is only used for getting/checking for the following info on a single user but in the future can be expanded to return .map() if userSoul is empty

        //sanitize input
        const userSoul = soul ? this.parseUserFromSoul(soul) : this.mySoul
        if(this.isMine(userSoul)){console.log('ignoring request for following info on myself');return;}
        unSubs = unSubs ? unSubs : []

        //get following info about this one soul
        unSubs = unSubs ? unSubs : []
        this.gunAppRoot.get('following').get(userSoul).on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                setFollowing({...value}) 
            }
        )   

    }

    async subscribeLastPost(soul, setLastPost, unSubs, once){

        //sanitize input
        const userSoul = soul ? this.parseUserFromSoul(soul) : this.mySoul
        unSubs = unSubs ? unSubs : []

        //get last post for user
        this.gun.get(userSoul).get('sovereign').get('profile').get('lastPost').on(
            (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                setLastPost({...value})
            }
        )

    }

    async subscribePost(postSoul, setPost, decryptionKey, unSubs, once){
        
        //get post
        unSubs = unSubs ? unSubs : []
        this.gun.get(postSoul).on(
            async (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}

                //copy post
                const post = {...value}

                //encrypted and no key
                if(post.encrypted && !decryptionKey){
                    console.log('encrypted post encountered but no decryption key provided, returning encrypted', postSoul)
                }
                
                //decrypt if necessary
                post.text = await this.decryptOrNot(post.text, decryptionKey)

                setPost(post)
            }
        )

    }

    async subscribePostAttachments(postSoul, setAttachments, decryptionKey, unSubs, once){
        
        //get attachments
        unSubs = unSubs ? unSubs : []
        this.gun.get(postSoul).get('attachments').map().on(
            async (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
            
                //copy attachment
                const attachment = {...value}
                
                //handle types of attachment
                switch (attachment.type) {
                    case 'url':
                        attachment.url = await this.decryptOrNot(attachment.url, decryptionKey)
                        attachment.title = await this.decryptOrNot(attachment.title, decryptionKey)
                        attachment.description = await this.decryptOrNot(attachment.description, decryptionKey)
                        attachment.image = await this.decryptOrNot(attachment.image, decryptionKey)
                        break;
                
                    case 'image':
                        attachment.url = await this.getFileFromIpfs(attachment.ipfsHash)
                        break;

                    case 'file':
                        //todo
                        break;

                    default:
                        break;
                }
            
                setAttachments(prevState => this.manageArrayState(prevState, attachment, key, 'key'))
            }
        )

    }
    
    async subscribeComments(postSoul, setComments, decryptionKey, unSubs, once){

        //get comments
        unSubs = unSubs ? unSubs : []
        const userSoul = this.parseUserFromSoul(postSoul)
        const postId = this.parseIDFromSoul(postSoul)
        this.gun.get(userSoul).get('sovereign').get('comments').get(postId).map().on(
            async (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                
                const comment = {...value}
                comment.text = await this.decryptOrNot(comment.text, decryptionKey)
                comment.user = key.splice(key.indexOf('~')) //parse the user from the key
                setComments(prevState => this.manageArrayState(prevState, comment, key, 'key'))

            }
        )

    }

    async getPreview(url){
        return this.linkPreviewProvider.getPreview(url)
    }

}
export default BusinessLogic