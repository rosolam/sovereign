class PreviewProviderInterface{

    canPreview = false;
    connectionStatus;

    constructor(options){
    }

    async connect(options){
        this.connectionStatus = {connect: true, error: ''};
        return this.connectionStatus;
    }

    async getPreview(url){
        let previewJson = {
            title: 'title',
            description: 'description',
            image: 'image',
            url: 'url'
        }
        return previewJson;
    }

}