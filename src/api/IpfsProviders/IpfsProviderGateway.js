class IpfsProviderGateway {

    canPut = false;
    canGet = true;
    connectionStatus ={ connect: true, error: '' };
    #gateway
    
    constructor(options) {
    }

    async connect(options) {
        
        if (!options || !options.gateway) {
            options = { gateway: 'https://dweb.link/ipfs/' }
        }

        this.#gateway = options.gateway

        return
    }

    async getFile(hash) {

        if (!hash || !this.canGet) {
            return
        }
        
        return this.#gateway + hash
    }

    async putFile(file) {
        return
    }

}
export default IpfsProviderGateway