const axios = require('axios');

class IpfsProviderPinata {

    canPut = false;
    canGet = false;
    connectionStatus;
    #options
    name = 'pinata';

    constructor(options) {
    }

    async connect(options) {

        //make sure we have the keys
        if(!options || !options.pinataApiKey || !options.pinataSecretApiKey){
            this.canPut = false;
            this.canGet = false;
            this.connectionStatus = { connect: false, error: 'missing pinata api key' };
            return this.connectionStatus
        }


        //set gateway
        options.gateway = options.gateway ? options.gateway :'https://dweb.link/ipfs/'
        this.#options = options

        //touch the server
        const url = `https://api.pinata.cloud/data/testAuthentication`;
        await axios
            .get(url, {
                headers: {
                    pinata_api_key: this.#options.pinataApiKey,
                    pinata_secret_api_key: this.#options.pinataSecretApiKey
                }
            })
            .then( (response) => {
                console.log('pinata connect response', response)
                this.canPut = true;
                this.canGet = true;
                this.connectionStatus = { connect: true, error: response };
            })
            .catch( (error) => {
                console.log('pinata connect error', error)
                this.canPut = false;
                this.canGet = true; //because we implement a gateway for pinata gets
                this.connectionStatus = { connect: false, error: error };
            });

        return this.connectionStatus

    }

    async getFile(hash) {

        if (!hash || !this.canGet) {
            return
        }

        return this.#options.gateway + hash

    }

    async putFile(file) {

        if(!file || !this.canPut){
            return
        }

        console.log('file',file, this.#options)


        const formData = new FormData();
        formData.append('file', file)
        console.log('data',formData)
        

        //const buf = await file.arrayBuffer() 
        const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        const hash = await axios
        .post(url, formData, {
            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                //'Content-Type': 'multipart/form-data',
                pinata_api_key: this.#options.pinataApiKey,
                pinata_secret_api_key: this.#options.pinataSecretApiKey
            }
        })
        .then( (response) => {
            //handle response here
            console.log('pinata response', response)
            return response.data.IpfsHash
        })
        .catch((error) => {
            //handle error here
            console.log('pinata error', error)
        });

        return hash

    }

}
export default IpfsProviderPinata