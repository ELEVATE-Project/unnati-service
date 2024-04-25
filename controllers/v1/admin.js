/**
 * name : admin.js
 * author : Prajwal
 * created-date : 04-Apr-2024
 * Description : Admin related information.
 */

// Dependencies
const adminHelper = require(MODULES_BASE_PATH + "/admin/helper");

module.exports = class Admin {

    static get name() {
        return "admin";
    }

  /**
  * @api {post} /project/v1/admin/createIndex/:_collectionName 
  * @apiVersion 1.0.0
  * @apiName createIndex
  * @apiGroup Admin
  * @apiParamExample {json} Request-Body:
    {
        "keys": [
            "scope.entities"
        ]
    }
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /project/v1/admin/createIndex/solutions
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
    {
        "message": "Keys indexed successfully",
        "status": 200
    }
  */


  /**
   * Indexing specified keys in a model
   * @method
   * @name createIndex
   * @param {Object} req - requested data.
   * @param {String} req.params._id - collection name.
   * @param {Array} req.body.keys - keys to be indexed.
   * @returns {Object} success/failure message.
   */

    async createIndex(req) {
      return new Promise(async (resolve, reject) => {
        try {
          let collection = req.params._id;
          let keys = req.body.keys;

          const isIndexed = await adminHelper.createIndex(
            collection,
            keys
          ) 

          return resolve(isIndexed)
  

        } catch (error) {
          return reject({
            status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
            errorObject: error,
          });
        }
      });
    }
    

}