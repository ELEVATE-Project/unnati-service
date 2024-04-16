/**
 * name : solutions.js
 * author : Aman
 * created-date : 19-Jan-2020
 * Description : Solution related information.
 */
// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");

module.exports = class Solutions extends Abstract {
  constructor() {
    super("solutions");
  }

  static get name() {
    return "solutions";
  }

  /**
* @api {post} /improvement-project/api/v1/solutions/create Create solution
* @apiVersion 1.0.0
* @apiName Create solution
* @apiGroup Solutions
* @apiParamExample {json} Request-Body:
* {
"programExternalId" : "AMAN_TEST_123-1607937244986",
"entityType" : "school",
"externalId" : "IMPROVEMENT-PROJECT-TEST-SOLUTION",
"name" : "Improvement project test solution",
"description" : "Improvement project test solution"
}
* @apiHeader {String} internal-access-token internal access token  
* @apiHeader {String} X-authenticated-user-token Authenticity token
* @apiSampleRequest /kendra/api/v1/solutions/create
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
"message": "Improvement project solution created successfully",
"status": 200,
"result": {
    "_id": "6006a94d67f675771573226d"
}
}
*/

  /**
 * Create solution.
 * @method
 * @name create
 * @param {Object} req - requested data.
 * req.body : {
    "name": "create solution",
    "programExternalId": "MAHARASTHA-AUTO-TARGETING",
    "resourceType": [],
    "language": [],
    "keywords": [],
    "concepts": [],
    "themes": [],
    "flattenedThemes": [],
    "entities": [
        "5beaa888af0065f0e0a10515",
        "5fd098e2e049735a86b748ac"
    ],
    "registry": [],
    "isRubricDriven": false,
    "enableQuestionReadOut": false,
    "allowMultipleAssessemts": false,
    "isDeleted": false,
    "entityType": "school",
    "type": "improvementProject",
    "subType": "improvementProject",
    "isReusable": false,
    "externalId": "01c04166-a65e-4e92-a87b-a9e4194e771lll",
    "minNoOfSubmissionsRequired": 2,
    "scope": {
        "entityType": "block",
        "entityTypeId": "5f32d8228e0dc8312404056e",
        "entities": [
            "5fd1b52ab53a6416aaeefc80",
            "5fd098e2e049735a86b748ac",
            "5fd1b52ab53a6416aaeefc83",
            "5fd1b52ab53a6416aaeefb20"
        ],
        "roles": "BEO"
    }
  }

 * @param {String} 
 * @returns {JSON} Created solution data.
 */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.createSolution(
          req.body,
          true
        );

        return resolve(solutionData);

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
   * Update solution.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {String} req.params._id -  solution external id.
   * @apiParamExample {json} Request-Body:
   * {
    "name": "create solution",
    "programExternalId": "MAHARASTHA-AUTO-TARGETING",
    "resourceType": [],
    "language": [],
    "keywords": [],
    "concepts": [],
    "themes": [],
    "flattenedThemes": [],
    "entities": [
        "5beaa888af0065f0e0a10515",
        "5fd098e2e049735a86b748ac"
    ],
    "registry": [],
    "isRubricDriven": false,
    "enableQuestionReadOut": false,
    "allowMultipleAssessemts": false,
    "isDeleted": false,
    "entityType": "school",
    "type": "improvementProject",
    "subType": "improvementProject",
    "isReusable": false,
    "externalId": "01c04166-a65e-4e92-a87b-a9e4194e771lll",
    "minNoOfSubmissionsRequired": 2,
    "scope": {
        "entityType": "block",
        "entityTypeId": "5f32d8228e0dc8312404056e",
        "entities": [
            "5fd1b52ab53a6416aaeefc80",
            "5fd098e2e049735a86b748ac"
        ],
        "roles": "BEO"
    }
}

   * @returns {JSON}
   */

   async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.update(
          req.params._id, 
          req.body, 
          req.userDetails.userInformation.userId,
          true
        );

        return resolve(solutionData);
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
   * List solutions.
   * @method
   * @name list
   * @param {Object} req - requested data.
   * @param {String} req.query.type - solution type.
   * @returns {JSON}
   */

   async list(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.list(
          req.query.type,
          req.query.subType ? req.query.subType : "",
          req.body,
          req.pageNo,
          req.pageSize,
          req.searchText
        );

        return resolve(solutionData);
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
    * @api {post} /unnati/v1/solutions/addRolesInScope/:solutionId Add roles in solutions
    * @apiVersion 1.0.0
    * @apiName Add roles in solutions
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/solutions/addRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added roles in solutions scope",
        "status": 200
      }
    */

     /**
   * Add roles in solution scope
   * @method
   * @name addRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} solution scope roles.
   */

     async addRolesInScope(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let solutionUpdated = await solutionsHelper.addRolesInScope(
            req.params._id,
            req.body.roles
          );
      
          return resolve(solutionUpdated);
  
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
    * @api {post} /unnati/v1/solutions/detailsBasedOnRoleAndLocation/:solutionId Solution details based on role and location.
    * @apiVersion 1.0.0
    * @apiName Targeted solution details
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {   
        "entityType" : "block",
        "entities" : [
            "5fd1b52ab53a6416aaeefc80",
            "5fd098e2e049735a86b748ac",
            "5fd1b52ab53a6416aaeefc83",
            "5fd1b52ab53a6416aaeefb20"
        ],
        "role" : "BEO,DEO,SPD"        
    }
    

    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/solutions/detailsBasedOnRoleAndLocation/5fc3dff14ea9b44f3340afe2
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully targeted solutions fetched",
    "status": 200,
    "result": {
        "_id": "5fc3dff14ea9b44f3340afe2",
        "isAPrivateProgram": true,
        "programId": "5ff438b04698083dbfab7284",
        "programExternalId": "TEST_SCOPE_PROGRAM",
        "programName": "TEST_SCOPE_PROGRAM",
        "programDescription": "TEST_SCOPE_PROGRAM",
        "entityType": "school",
        "entityTypeId": "5d15a959e9185967a6d5e8a6",
        "externalId": "f449823a-06bb-4a3f-9d49-edbe1524ebbb-1606672337956",
        "projectTemplateId": "5ff4a46aa87a5c721f9eb664"
    }}
    */

     /**
   * Solution details based on role and location.
   * @method
   * @name detailsBasedOnRoleAndLocation
   * @param {Object} req - requested data.
   * @returns {JSON} Created solution data.
   */

  async detailsBasedOnRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionDetails = 
        await solutionsHelper.detailsBasedOnRoleAndLocation(
          req.params._id,
          req.body,
          req.query.type ? req.query.type : ""
        );
          
        return resolve(solutionDetails);

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
    * @api {post} /unnati/v1/solutions/removeRolesInScope/:solutionId Remove roles from solutions scope
    * @apiVersion 1.0.0
    * @apiName 
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "roles" : ["DEO","SPD"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/solutions/removeRolesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed roles in solution scope",
        "status": 200
      }
    */

     /**
   * Remove roles in solution scope
   * @method
   * @name removeRolesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.roles - Roles to be added.
   * @returns {Array} Removed solution scope roles.
   */

     async removeRolesInScope(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let solutionUpdated = await solutionsHelper.removeRolesInScope(
            req.params._id,
            req.body.roles
          );
      
          return resolve(solutionUpdated);
  
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
  * @api {get} /unnati/v1/solutions/fetchLink/:solutionId
  * @apiVersion 1.0.0
  * @apiName Get link by solution id
  * @apiGroup Solutions
  * @apiSampleRequest /unnati/v1/solutions/fetchLink/5fa28620b6bd9b757dc4e932
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solution Link generated successfully",
    "status": 200,
    "result": "https://dev.sunbirded.org/manage-learn/create-observation/38cd93bdb87489c3890fe0ab00e7d406"
    }
  */

   /**
   * Get link by solution id.
   * @method
   * @name fetchLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution Id
   * @returns {Array}
   */

  async fetchLink(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.fetchLink(
          req.params._id,
          req.userDetails.userInformation.userId
        );

        return resolve(solutionData);

      }
      catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

   /**
  * @api {post} /unnati/v1/solutions/verifyLink/:link
  * @apiVersion 1.0.0
  * @apiName verify Link
  * @apiGroup Solutions
  * @apiSampleRequest /unnati/v1/solutions/verifyLink/6f8d395f674dcb3146ade10f972da9d0
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Request:
  * {
  *   "role" : "HM,DEO",
      "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
      "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
      "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
    }
  * @apiParamExample {json} Response:
  * {
      "message": "Solution Link verified successfully",
      "status": 200,
      "result": {
          isATargetedSolution : true/false,
          type: improvementProject,
          solutionId : “5f6853f293734140ccce90cf”,
          projectId : “”,
          obervationId: “”,
          surveyId: “”
      }
    }
  */

   /**
   * verify Link
   * @method
   * @name verifyLink
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution link
   * @returns {Array}
   */

   async verifyLink(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsHelper.verifyLink(
          req.params._id,
          req.body,
          req.userDetails.userInformation.userId,
          req.userDetails.userToken,
          req.query.hasOwnProperty("createProject") ? UTILS.convertStringToBoolean(req.query.createProject) : true
        );

        return resolve(solutionData);

      }
      catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }


   /**
    * @api {post} /unnati/v1/solutions/addEntitiesInScope/:solutionId Add entities in solutions
    * @apiVersion 1.0.0
    * @apiName Add entities in solutions
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/solutions/addEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully added entities in solution scope",
        "status": 200
      }
    */

     /**
   * Add entities in solution scope
   * @method
   * @name addEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Solution scope entities updation.
   */

     async addEntitiesInScope(req) {
      return new Promise(async (resolve, reject) => {
        try {
  
          let solutionUpdated = await solutionsHelper.addEntitiesInScope(
            req.params._id,
            req.body.entities
          );
      
          return resolve(solutionUpdated);
  
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
    * @api {post} /unnati/v1/solutions/removeEntitiesInScope/:solutionId Remove entities from solution scope.
    * @apiVersion 1.0.0
    * @apiName Remove entities from solution scope.
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
      "entities" : ["5f33c3d85f637784791cd830"]
    }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /unnati/v1/solutions/removeEntitiesInScope/5ffbf8909259097d48017bbf
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
        "message": "Successfully removed entities in solution scope",
        "status": 200
      }
    */

     /**
   * Remove entities in slution scope
   * @method
   * @name removeEntitiesInScope
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @param {Array} req.body.entities - Entities to be added.
   * @returns {Array} Program scope roles.
   */

  async removeEntitiesInScope(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionUpdated = await solutionsHelper.removeEntitiesInScope(
          req.params._id,
          req.body.entities
        );
    
        return resolve(solutionUpdated);

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