class PreviewProviderNone{

    canPreview = false;
    connectionStatus = { connect: true, error: ''};
    name = 'no previews'

    constructor(options){
    }

    async connect(options){
        return this.connectionStatus
    }

    async getPreview(url){
       return { 
            title: '',
            description: '',
            image: '',
            url: 'url'
        }
    }

}
export default PreviewProviderNone