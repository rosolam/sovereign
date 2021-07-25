import Gun from 'gun'
import SEA from 'gun/sea'
import IpfsProviderLocalNode from './IpfsProviders/IpfsProviderLocalNode'
import IpfsProviderGateway from './IpfsProviders/IpfsProviderGateway'
import IpfsProviderPinata from './IpfsProviders/IpfsProviderPinata'
import PreviewProviderLinkPreview from './PreviewProviders/PreviewProviderLinkPreview'
import PreviewProviderNone from './PreviewProviders/PreviewProviderNone'
import crypto from 'crypto'
import { BsChevronCompactLeft } from 'react-icons/bs'

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
    mySEAKeyPair;

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
        return await SEA.decrypt(encValue, this.mySEAKeyPair)
    }

    async setSetting(name, value){

        const encValue = await SEA.encrypt(value, this.mySEAKeyPair)
        return await this.gunAppRoot.get('settings').get(name).put(encValue).then()
    }

    async enableIpfs(provider){

        let ipfs
        let result

        switch (provider) {
            case 'local':
                console.log('attempting to connect to a local IPFS node')
                ipfs = new IpfsProviderLocalNode()
                result = await ipfs.connect()
                break;
            
            case 'pinata':
            
                console.log('attemping to connect to Pinata')
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
            console.log('Not able to connect to ipfs provider:', ipfs.name)    
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

            //cache the new user data to create during the login auth event because we can't write to the user node at this point yet
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
            this.mySEAKeyPair = ack.sea
            
            //if we aren't connected to a local node, let's try to connect to pinata now
            if(!this.ipfsProvider.canPut){ await this.enableIpfs('pinata')} //await it to help ensure we connect before re-rendering

            //if we aren't connected to a preview provider let's try to connect to linkpreview.net
            if(!this.ipfsProvider.canPreview){ await this.enableLinkPreview('linkpreview.net')} //await it to help ensure we connect before re-rendering
                        
            //call back to app to set state of logged in
            this.#setLoggedIn(true)

        })
        
    }

    login(user, password, recall, cb){

        console.log('login request')
        
        //recall
        if(recall){
            this.gunUser.recall({sessionStorage: true})
        } else {
            this.gunUser.auth(user, password, cb)
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
            return Math.round(diff/60000) + ' mins ago'
        }else if(diff < 86400000){
            return Math.round(diff/3600000) + ' hrs ago'
        }else if(diff < 604800000){
            return Math.round(diff/86400000) + ' days ago'
        }else if(diff < 2629743831.225){
            return Math.round(diff/604800000) + ' wks ago'
        }else if(diff < 31556925974.7){
            return Math.round(diff/2629743831.225) + ' mos ago'
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

        //force empty objects to null because empty objects evaluate to true and we want to see these as deletes
        if(value && Object.keys(value).length === 0){
            value = null;
        }

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
                console.log('removing item from state')
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

    async followUser(userSoul, follow){
        
        //ensure soul is just for the user
        userSoul = this.parseUserFromSoul(userSoul)

        //follow or unfollow?
        if(!follow){
            this.gunAppRoot.get('following').get(userSoul).put(null)
        } else {

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
        
    }

    async encryptOrNot(value, key){
        //returns an encrypted value or if no key, the unencrypted value
        return key ? await SEA.encrypt(value, key) : value;
    }

    async decryptOrNot(value, key){
        //returns an encrypted value or if no key, the unencrypted value
        return key ? await SEA.decrypt(value, key) : value;
    }

    async trustUser(userSoul, trust){

        //ensure soul is just for the user
        userSoul = this.parseUserFromSoul(userSoul)

        //update comments cert
        const userPub = this.parsePubFromSoul(userSoul)
        const cert = trust ? await SEA.certify(
            userPub,
            {"*": "sovereign/comments","+":"*"},
            this.mySEAKeyPair,
            null,
            {blacklist: 'certs/comments/blacklist'}
        ) : null
        this.gunAppRoot.get('certs').get('comments').get(userSoul).put(cert)

        //update blacklist
        this.gunAppRoot.get('certs').get('comments').get('blacklist').get(userPub).put(!trust)

        //update followed user trust property
        this.gunAppRoot.get('following').get(userSoul).get('trusted').put(trust)

        //iterate over every past post and add/remove trust
        this.gunAppRoot.get('posts').get('private').once().map().once(async (post) => {
            
            //if tombstone or not encrypted, then return
            if(!post){return}

            const postSoul = Gun.node.soul(post)
            
            //trust or untrust?
            if(trust){
                const encryptedKey = await this.gun.get(postSoul).get('trusted').get(this.mySoul).then()
                const decryptedKey = await SEA.decrypt(encryptedKey, this.mySEAKeyPair)
                this.createPostTrust(postSoul,decryptedKey)
            } else {
                this.gun.get(postSoul).get('trusted').get(userSoul).put(null)
            }
 
        })

    }

    async createPostTrust(postSoul, encryptionKey){

        //add trust for self
        const encryptedKey = await SEA.encrypt(encryptionKey, this.mySEAKeyPair)
        this.gun.get(postSoul).get('trusted').get(this.mySoul).put(encryptedKey)

        //add trust for trusted
        this.gunAppRoot.get('following').once().map().once(
            async (value, key, _msg, _ev) => {
     
                //trusted?
                if(!value || !value.trusted || !value.user){return}

                //encrypyt decryption key using public key of user and add to the post trust
                this.gun.get(value.user).once( async (user) => {

                    const sharedSecret = await SEA.secret(user.epub,this.mySEAKeyPair)
                    const encryptedKey = await SEA.encrypt(encryptionKey, sharedSecret)
                    this.gun.get(postSoul).get('trusted').get(key).put(encryptedKey)

                })

            }
        )

    }

    async createComment(postSoul, encryptionKey, text){           

        //build comment
        const created = new Date().getTime()
        const commentKey = created + this.mySoul
        const comment = {
            text: await this.encryptOrNot(text, encryptionKey),
            created: created,
        } 

        //write the comment
        const postID = this.parseIDFromSoul(postSoul)
        if(this.isMine(postSoul)){
            //write to my user node
            this.gunAppRoot.get('comments').get(postID).get(commentKey).put(comment)
        }else{
            //write to another user's node using cert
            const ownerSoul = this.parseUserFromSoul(postSoul)   
            const cert = await this.gun.get(ownerSoul).get('sovereign').get('certs').get('comments').get(this.mySoul).then() 
            this.gun.get(ownerSoul).get('sovereign').get('comments').get(postID).get(commentKey).put(comment, null, {opt: {cert: cert}})
        }

    }

    async deleteSoul(soul, cert){

        //define function that will call itself recursively
        const recursiveDelete = async (soul) => {
            
            //get root node we want to delete
            const node = await this.gun.get(soul).then()
            
            //iterate over each property of this node
            for(const prop in node){

                //ignore _ prop
                if(prop=='_'){continue}

                //if this is a link and that link is a child of the soul we are deleting, then recursively delete it first
                if(node[prop]['#'] && node[prop]['#'].startsWith(soul)){
                    await recursiveDelete(prop['#'])
                }

                //at this point we have a non-link property or a linked node that has already been deleted, time to null it out
                if(this.isMine(soul)){
                    this.gun.get(soul).get(prop).put(null)
                }else{
                    this.gun.get(soul).get(prop).put(null, cert)
                }

            }
        }

        //delete the node recursively
        //await recursiveDelete(soul)

        //finally unlink the parent/child node of the soul passed in
        const keyDelim = soul.lastIndexOf('/') 
        const path = soul.substring(0,keyDelim) 
        const key = soul.substr(keyDelim + 1)
        if(this.isMine(soul)){
            console.log('delete soul I own', path, key)
            this.gun.get(path).get(key).put(null)
        }else{
            console.log('delete soul I do not own', path, key)
            this.gun.get(path).get(key).put(null,null, cert)
        }

    }

    async deleteComment(commentSoul){

        if(!commentSoul){return}
              
        if(this.isMine(commentSoul)){
            this.deleteSoul(commentSoul)
        } else {
            const cert = await this.gun.get(this.parseUserFromSoul(commentSoul)).get('sovereign').get('certs').get('comments').get(this.mySoul).then()  //todo: check to see if the cert includes me
            this.deleteSoul(commentSoul, {opt: {cert: cert}})
        }

    }

    async updatePost(postSoul, post, encryptionKey, toggleEncrypt){
         
        //update modified date
        this.gun.get(postSoul).get('modified').put(new Date().getTime())

        //update post text
        this.gun.get(postSoul).get('text').put(await this.encryptOrNot(post.text,encryptionKey))

        //get list of attachment keys
        const postAttachments = await this.gun.get(postSoul).get('attachments').then()

        //remove deleted attachments
        for(const attachmentKey in postAttachments){

            //ignore Gun property and keys that are already nulled out
            if(attachmentKey=='_' || !postAttachments[attachmentKey]) {continue}
            
            //is this attachment key missing in the new list of attachments?
            if(!post.attachments.find((attachment) => {return attachment.key==attachmentKey})){
                //delete it
                this.gun.get(postSoul).get('attachments').get(attachmentKey).put(null) 
            }
        }

        //add new attachments
        for(const attachment of post.attachments){
            //does this attachment key already exist?
            if(!postAttachments[attachment.key]){
                //add it
                this.addAttachmentToPost(postSoul, attachment, encryptionKey)
            }
        }
        
        //toggle encryption?
        if(toggleEncrypt){

            if(encryptionKey){
                //private -> public
            }else {
                //public -> private
            }

        }
        

    }

    async createPost(post, encrypt){

        //create new post
        const encryptKey = encrypt ? crypto.randomBytes(32).toString('hex') : '' //32 bytes = 256 bit
        const created = new Date().getTime()
        const key = created + this.mySoul
        this.gunAppRoot.get('posts').get(encrypt ? 'private' : 'public').get(key).put({
            text: await this.encryptOrNot(post.text, encryptKey),
            created: created,
            modified: created,
            key: key
        }).once(async (data) => {
                        
            //get the post and add ref to profile as last post
            const postSoul = Gun.node.soul(data)
            const postRef = this.gun.get(postSoul)
            this.gunAppRoot.get('profile').get('lastPost').put(postRef)
            if(!encrypt){this.gunAppRoot.get('profile').get('lastPublicPost').put(postRef)}

            //add decryption keys if encrypted
            if(encrypt){
                this.createPostTrust(postSoul, encryptKey)
            }
            
            //add all attachments
            if(post.attachments && post.attachments.length){
                post.attachments.forEach(async attachment => {

                    //add attachment
                    this.addAttachmentToPost(postSoul, attachment, encryptKey)

                });
            }

        })

    }

    async addAttachmentToPost(postSoul, attachment, encryptKey){

      //what type of attachment?
      let attachmentNode = {}
      if(attachment.type == 'url'){
          attachmentNode = {
              key: attachment.key,
              type: 'url',
              url: await this.encryptOrNot(attachment.url, encryptKey),
              title: await this.encryptOrNot(attachment.title, encryptKey),
              description: await this.encryptOrNot(attachment.description, encryptKey),
              image: await this.encryptOrNot(attachment.image, encryptKey)
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
      this.gun.get(postSoul).get('attachments').get(attachmentNode.key).put(attachmentNode)

    }

    async deletePost(soul){
        
        //need to update last post in profile?
        const lastPostKey = await this.gunAppRoot.get('profile').get('lastPost').then()
        const deletedPostKey = await this.gun.get(soul).get('key').then()
        if(lastPostKey && lastPostKey == deletedPostKey){
            this.gunAppRoot.get('profile').get('lastPost').put(false)
        }
        
        //delete
        this.deleteSoul(soul)
        
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

    async subscribePostDecryptionKey(postSoul, setDecryptionKey, unSubs, once){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

        //check if this soul is private or public
        if(!postSoul.includes('/private/')){ setDecryptionKey(null);return;} //todo:improve with regex

        //check to see if this user is trusted and get the (encrypted) decryption key
        this.gun.get(postSoul).get('trusted').get(this.mySoul).on(
            async (encryptedKey, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                
                //if trusted, let's decrypt the decryption key
                if(encryptedKey){    

                    if(this.isMine(postSoul)){
                        //mine: I can just decrypt with my private key
                        const decryptionKey = await SEA.decrypt(encryptedKey, this.mySEAKeyPair);
                        setDecryptionKey(decryptionKey)
                    } else {
                        //not mine: I need to create a shared private key using the epub of the owner post
                        this.gun.get(this.parseUserFromSoul(postSoul)).get('epub').once( async (epub) => {
                            if(!epub){return}
                            const sharedSecret = await SEA.secret(epub, this.mySEAKeyPair)
                            const decryptionKey = await SEA.decrypt(encryptedKey, sharedSecret);
                            setDecryptionKey(decryptionKey)
                        })
                    }

                }
            }
        )

    }

    async subscribePosts(soul, setPosts, unSubs, once){

        //track events to unsub
        unSubs = unSubs ? unSubs : []

        //single user or following (plus self)?
        const userSoul = this.parseUserFromSoul(soul)
        if(userSoul){

            //subscribe to public posts
            this.gun.get(userSoul).get('sovereign').get('posts').get('public').map().on(
                (value, key, _msg, _ev) =>  {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}
                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                }
            )  

            //if its this user's posts then subscribe to private without checking
            if(this.isMine(soul)){

                //subscribe to private posts
                this.gun.get(userSoul).get('sovereign').get('posts').get('private').map().on(
                    (value, key, _msg, _ev) =>  {
                        if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                        if(once){_ev.off()}
                        setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                    }
                )  

            }else{ 

                //subscribe to another user's posts based on whether I am trusted or not by that user
                this.gun.get(userSoul).get('sovereign').get('following').get(this.mySoul).get('trusted').once(
                    (trusted, key, _msg, _ev) =>  {
                        
                        //subscribe to private posts if I am trusted
                        if(trusted){
                            this.gun.get(userSoul).get('sovereign').get('posts').get('private').map().on(
                                (value, key, _msg, _ev) =>  {
                                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                                    if(once){_ev.off()}
                                    setPosts(prevState => this.manageArrayState(prevState, value, key, 'created'))
                                }
                            )  
                        }
                        
                    }
                )  
                
            }

        }else{

            /* //handle my own posts
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
            )             */    

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

        if(this.isMine(userSoul)){

            //get this users last post
            this.gun.get(userSoul).get('sovereign').get('profile').get('lastPost').on(
                (value, key, _msg, _ev) => {
                    if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                    if(once){_ev.off()}

                    //if its private, get the key and decrypt the text otherwise return it as is
                    const postSoul = Gun.node.soul(value);
                    if(postSoul.includes('/private/')){
                        this.subscribePostDecryptionKey(postSoul, async (decryptionKey) => {
                            const decryptedPost = {...value}
                            decryptedPost.text = await SEA.decrypt(decryptedPost.text, decryptionKey)
                            setLastPost(decryptedPost)
                        },unSubs,true)
                    }else{
                        setLastPost({...value})
                    }
                    
                }
            )

        } else {

            //see if this user is trusted
            this.gun.get(userSoul).get('sovereign').get('following').get(this.mySoul).get('trusted').once(
                (trusted, key, _msg, _ev) => {

                    //get last post for user based on trusted or not to determine if we should show last post or last PUBLIC post
                    const lastPostKey = trusted ? 'lastPost' : 'lastPublicPost'
                    this.gun.get(userSoul).get('sovereign').get('profile').get(lastPostKey).on(
                        (value, key, _msg, _ev) => {
                            if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                            if(once){_ev.off()}
                            
                            //if its private, get the key and decrypt the text otherwise return it as is
                            const postSoul = Gun.node.soul(value);
                            if(postSoul.includes('/private/')){
                                this.subscribePostDecryptionKey(postSoul, async (decryptionKey) => {
                                    const decryptedPost = {...value}
                                    decryptedPost.text = await SEA.decrypt(decryptedPost.text, decryptionKey)
                                    setLastPost(decryptedPost)
                                },unSubs,true)
                            }else{
                                setLastPost({...value})
                            }
                            
                        }
                    )

                }

            )


        }


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
            
                //tombstone?
                if(!value){
                   setAttachments(prevState => this.manageArrayState(prevState, value, key, 'key'))
                   return
                }

                //copy attachment
                const attachment = {...value}
                
                console.log('attachment', postSoul,value, attachment)

                //handle types of attachment
                switch (attachment.type) {
                    case 'url':
                        attachment.url = await this.decryptOrNot(attachment.url, decryptionKey)
                        attachment.title = await this.decryptOrNot(attachment.title, decryptionKey)
                        attachment.description = await this.decryptOrNot(attachment.description, decryptionKey)
                        attachment.image = await this.decryptOrNot(attachment.image, decryptionKey)
                        break;
                
                    case 'image':
                        attachment.objectUrl = await this.getFileFromIpfs(attachment.ipfsHash)
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

                //make sure the key has a single tilde to ensure that the key has not been manipulated by a bad actor commentor (by appending multiple public keys)
                //todo validate fully with a good REGEX
                if ((key.match(/~/g) || []).length != 1){
                    console.log('comment key is corrupt',key)
                    return
                };

                //tombstone?
                if(!value){
                    setComments(prevState => this.manageArrayState(prevState, value, key, 'key'))
                    return
                }

                //enrich value and respond
                const comment = {...value}
                comment.text = await this.decryptOrNot(comment.text, decryptionKey)
                comment.user = key.substr(key.indexOf('~'),88) //parse the user from the key with explicit length to prevent extra characters from being appended by a bad actor commentor                
                comment.soul = Gun.node.soul(value)
                setComments(prevState => this.manageArrayState(prevState, comment, key, 'key'))

            }
        )

    }

    async subscribeTrusted(soul, setTrust, unSubs, once){

        unSubs = unSubs ? unSubs : []

        //if this is me then respond true immediately
        if(this.isMine(soul)){setTrust(true); return;}

        //subscribe to a cert for me in another users's node 
        const userSoul = this.parseUserFromSoul(soul)
        this.gun.get(userSoul).get('sovereign').get('certs').get('comments').get(this.mySoul).on(
            async (value, key, _msg, _ev) => {
                if(!unSubs.includes(_ev)){unSubs.push(_ev)}
                if(once){_ev.off()}
                setTrust(value)
            }
        )

    }

    async getPreview(url){
        return this.linkPreviewProvider.getPreview(url)
    }

}
export default BusinessLogic