
class BaseRepository{

    _model;

    constructor(model){
        this._model = model;
    }

    async get (req, res){
        try{
            return await this._model.find({});
        }catch(e){
            throw Error(`">>> BaseRepository:get() --> " ${e}`);
        }
    }     
}

/* EXPORTACIONES */
module.exports = {
  BaseRepository
}