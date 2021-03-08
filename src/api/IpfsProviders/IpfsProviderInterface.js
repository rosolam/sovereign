class IpfsProviderInterface{

    canPut = false;
    canGet = false;
    connectionStatus;
    name = 'ipfs interface';

    constructor(options){
    }

    async connect(options){
        this.connectionStatus = {connect: true, error: ''};
        return this.connectionStatus;
    }

    async getFile(hash){
        let file;
        return file;
    }

    async getPutFile(file){
        let hash;
        return hash;
    }

}