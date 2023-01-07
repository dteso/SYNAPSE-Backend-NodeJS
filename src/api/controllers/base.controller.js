const { response } = require('express');
const User = require('../../dal/models/user.model');
const { BaseService } = require('../../services/base.service');

class BaseController {

  _model;

  constructor(model) {
    this._model = model;
    this.getEntities = this.getEntities.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  ///////////////////////////////////////
  /*                 GET               */
  ///////////////////////////////////////
  async getEntities(req, res) {
    console.log("GET REQUEST");
    const baseService = new BaseService(this._model);
    try {
      const result = await baseService.getEntities(req, res);
      res.json({
        ok: true,
        msg: `All ${this._model.modelName}s loaded`,
        result
      });
    } catch (e) {
      throw Error(`>>> BaseController: get() ---> Error getting entities ${e}`);
    }

  }


  //////////////////////////////////////////
  /*                 POST                 */
  //////////////////////////////////////////
  create = async (req, res = response) => {
    console.log("POST REQUEST");
    try {
      const entity = new this._model(req.body);
      await entity.save();
      res.status(200).json({
        ok: true,
        msg: `${this._model.modelName} CREATED sucessfully`,
        entity
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "An error ocurred. Read logs."
      });
    }
  }



  ////////////////////////////////////////
  /*                PUT                */
  ///////////////////////////////////////
  update = async (req, res = response) => {
    console.log("PUT REQUEST");
    const uid = req.params.id;
    try {
      const dbEntity = await this._model.findById(uid);
      if (!dbEntity) {
        console.log("Register NOT FOUND by Id");
        return res.status(404).json({
          ok: false,
          msg: `${this._model.modelName} NOT FOUND by uid = ${uid}`,
        });
      }
      console.log("BODY:", req.body);
      const updatedEntity = await this._model.findByIdAndUpdate(uid, req.body, { new: true, useFindAndModify: false }); //{new: true} hace que en el momento de la actualización devuelva el usuario nuevo y no el guardado hasta ahora
      res.json({
        ok: true,
        entity: updatedEntity,
        msg: `${this._model.modelName} uid = ${uid} UPDATED sucessfully`,
      })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "An error ocurred. Read logs."
      });
    }
  }


  //////////////////////////////////////////////
  /*                DELETE                  */
  //////////////////////////////////////////////
  delete = async (req, res = response) => {
    console.log("DELETE REQUEST");
    const uid = req.params.id;
    try {
      const dbEntity = await this._model.findById(uid);
      if (!dbEntity) {
        console.log("Entity does not exists");
        return res.status(404).json({
          ok: false,
          msg: "Entity not found by Id = " + uid
        });
      }
      await this._model.findByIdAndDelete(uid);
      return res.json({
        ok: true,
        msg: `${this._model.modelName} uid = ${uid} DELETED sucessfully`,
        entity: dbEntity
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        error: error
      });
    }

  }
}


/* EXPORTACIONES */
module.exports = {
  BaseController
}