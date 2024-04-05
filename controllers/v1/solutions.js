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
 * @param {String} req.params._id - solution id.
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

  }