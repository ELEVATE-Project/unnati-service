/**
 * name : programs.js
 * author : vishnu
 * created-date : 09-Mar-2022
 * Description : programs related information.
*/


// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper")


module.exports = class  Programs extends Abstract{
  constructor() {
    super("programs");
  }
  static get name() {
    return "programs";
  }
    

   /**
   * Create program.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @returns {JSON} - created program document.
   */

    async create(req) {
      return new Promise(async (resolve, reject) => {
        try {
          let programCreationData = await programsHelper.create(
            req.body,
            req.userDetails.userId,
            true
          );
          
          return resolve({
            message : CONSTANTS.apiResponses.PROGRAMS_CREATED,
            result : _.pick(programCreationData,["_id"])
          });
  
        }
        catch (error) {
          reject({
            status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
            errorObject: error
          })
        }
      })
    }


  /**
   * Update program.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @apiParamExample {json} Request-Body:
   * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          "5b98fa069f664f7e1ae7498c"
      ],
      "scope" : {
          "entityType" : "state",
          "entities" : ["bc75cc99-9205-463e-a722-5326857838f8","8ac1efe9-0415-4313-89ef-884e1c8eee34","5f33c3d85f637784791cd830"],
          "roles" : ["HM","BEO"]
      },
      "requestForPIIConsent" : true
  }

   * @param {Object} 
   * @returns {JSON} - 
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdationData = await programsHelper.update(
          req.params._id,
          req.body,
          req.userDetails.userId,
          true
        );
        
        programUpdationData.result = programUpdationData.data;
        return resolve(programUpdationData);

      }
      catch (error) {
        reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

  /**
   * Details of the program
   * @method
   * @name details
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @returns {Array} Program scope roles.
   */

      async details(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let programData = await programsHelper.details(
            req.params._id
          );
  
          programData["result"] = programData.data;
      
          return resolve(programData);
          
        } catch (error) {
          return reject({
            status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
            errorObject: error
          });
        }
      });
    }


       /**
    * @api {post} /unnati/v1/programs/addRolesInScope/:programId Add roles in programs
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/programs/addRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added roles in program scope",
        "status": 200
      }
    */

     /**
   * Add roles in program scope
   * @method
   * @name addRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Program scope roles.
   */

  async addRolesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.addRolesInScope(
          req.params._id,
          req.body.roles
        );
    
        return resolve(programUpdated);

      } catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

   /**
    * @api {post} /unnati/v1/programs/addEntitiesInScope/:programId Add roles in programs
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/programs/addEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added entities in program scope",
        "status": 200
      }
    */

     /**
   * Add entities in program scope
   * @method
   * @name addEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

     async addEntitiesInScope(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let programUpdated = await programsHelper.addEntitiesInScope(
            req.params._id,
            req.body.entities
          );
      
          return resolve(programUpdated);
  
        } catch (error) {
          return reject({
            status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
            errorObject: error
          });
        }
      });
    }


       /**
    * @api {post} /unnati/v1/programs/removeRolesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/programs/removeRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed roles in program scope",
        "status": 200
      }
    */

     /**
   * Remove roles in program scope
   * @method
   * @name removeRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Program scope roles.
   */

     async removeRolesInScope(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let programUpdated = await programsHelper.removeRolesInScope(
            req.params._id,
            req.body.roles
          );
      
          return resolve(programUpdated);
  
        } catch (error) {
          return reject({
            status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
            errorObject: error
          });
        }
      });
    }



     /**
    * @api {post} /unnati/v1/programs/removeEntitiesInScope/:programId Add roles in programs
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Programs
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/programs/removeEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed entities in program scope",
        "status": 200
      }
    */

     /**
   * Remove entities in program scope
   * @method
   * @name removeEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - program id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

  async removeEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdated = await programsHelper.removeEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(programUpdated);

      } catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }
        
}