const ipfsClient = require('ipfs-http-client')

class IpfsProviderLocalNode {

    canPut = false;
    canGet = false;
    connectionStatus;
    #ipfs
    
    constructor(options) {
    }

    async connect(options) {

        if (!options || !options.server) {
            options = { server: '/ip4/127.0.0.1/tcp/5001' }
        }

        this.#ipfs = ipfsClient(options.server)

        try {

            //touch the server
            const id = await this.#ipfs.id()
            
            this.canPut = true;
            this.canGet = true;
            this.connectionStatus = { connect: true, error: '' }
            return this.connectionStatus

        } catch (err) {

            this.canPut = false;
            this.canGet = false;
            this.connectionStatus = { connect: false, error: err };
            return this.connectionStatus

        }

    }

    async getFile(hash) {

        if (!hash || !this.canGet) {
            return
        }

        try{
            const chunks = []
            for await (const chunk of this.#ipfs.cat(hash)) {
                chunks.push(Buffer.from(chunk))  //found that casting each chunk to a buffer is necessary when connecting to IPFS via API
            }
    
            const buf = Buffer.concat(chunks)
            const blob = new Blob([buf])
            const objSrc = window.URL.createObjectURL(blob)
            return objSrc
  
        }catch (err){
            return null
        }

    }

    async putFile(file) {

        if(!file || !this.canPut){
            return
        }

        const buf = await file.arrayBuffer() 

        //https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
        const result = await this.#ipfs.add(buf)
        console.log('ipfs local node put', result)
        return result.cid.string

    }

}
export default IpfsProviderLocalNode