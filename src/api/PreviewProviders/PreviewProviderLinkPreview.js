const axios = require('axios');

class PreviewProviderLinkPreview{

    canPreview = false;
    connectionStatus;
    #options
    name = 'linkpreview.net'

    constructor(options){
    }

    async connect(options){

        //make sure we have the keys
        this.#options = options
        if(!options || !options.apiKey){
            this.canPreview = false;
            this.connectionStatus = { connect: false, error: 'missing api key' };
            return this.connectionStatus
        }
        
        //touch the server
        const requestUrl = 'http://api.linkpreview.net/?key=' + this.#options.apiKey + '&q=' + encodeURIComponent('https://www.google.com');
        await axios
            .get(requestUrl)
            .then( (response) => {
                console.log('link preview  connect response', response)
                this.canPreview = true;
                this.connectionStatus = { connect: true, error: response };
            })
            .catch( (error) => {
                console.log('link preview connect error', error)
                this.canPreview = false;
                this.connectionStatus = { connect: false, error: error };
            });

        return this.connectionStatus

    }

    async getPreview(url){

        //touch the server
        const requestUrl = 'http://api.linkpreview.net/?key=' + this.#options.apiKey + '&q=' + encodeURIComponent(url);
        const response = await axios
            .get(requestUrl)
            .then( (response) => {
                console.log('link preview  connect response', response)
                return response.data
            })
            .catch( (error) => {
                console.log('link preview connect error', error)
                this.canPreview = false;
                this.connectionStatus = { connect: false, error: error };
            });

        return response
    }

}
export default PreviewProviderLinkPreview