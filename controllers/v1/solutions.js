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

        solutionData["result"] = solutionData.data;

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
          req.userDetails.id,
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

        solutionData["result"] = solutionData.data;

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

  }