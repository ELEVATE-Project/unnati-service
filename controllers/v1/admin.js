/**
 * name : admin.js
 * author : Ankit Shahu
 * created-date : 20-09-2023
 * Description : Admin Related information.
 */

// Dependencies
const adminHelper = require(MODULES_BASE_PATH + '/admin/helper');

module.exports = class Admin {
  static get name() {
    return 'admin';
  }

  /**
     * @api {post} /kendra/api/v1/admin/dbFind/:collectionName
     * List of data based on collection
     * @apiVersion 1.0.0
     * @apiGroup Admin
     * @apiSampleRequest /kendra/api/v1/admin/dbFind/projects
     * @param {json} Request-Body:
     * {
     * "query" : {
          "userId": "18155ae6-493d-4369-9668-165eb6dcaa2a",
          "_id": "601921116ffa9c5e9d0b53e5"
        },
       "projection" : ["title"],
       "limit": 100,
       "skip": 2
      }
     * @apiParamExample {json} Response:
     * {
          "message": "Data Fetched Or Updated Successfully",
          "status": 200,
          "result": [
              {
                  "_id": "601921e86ffa9c5e9d0b53e7",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              },
              {
                  "_id": "60193ce26ffa9c5e9d0b53fe",
                  "title": "Please edit this project for submitting your Prerak Head Teacher of the Block-19-20 project"
              }
          ]
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

  /**
   * List of data based on collection
   * @method
   * @name dbFind
   * @param {String} _id - MongoDB Collection Name
   * @param {Object} req - Req Body
   * @returns {JSON} list of data.
   */

  async dbFind(req) {
    return new Promise(async (resolve, reject) => {
      try {
        if (req.body.mongoIdKeys) {
          req.body.query = await adminHelper.convertStringToObjectIdInQuery(req.body.query, req.body.mongoIdKeys);
        }

        let mongoDB = await adminHelper.list(
          req.params._id,
          req.body.query,
          req.body.projection ? req.body.projection : [],
          'none',
          req.body.limit ? req.body.limit : 100,
          req.body.skip ? req.body.skip : 0,
        );

        let mongoDBDocuments = await database.models[req.params._id]
          .find(mongoDB.queryObject, mongoDB.projectionObject)
          .skip(mongoDB.skippingValue)
          .limit(mongoDB.limitingValue);

        // finding document count from db. We can't get it from result array length because a limiting value is passed
        let docCount = await database.models[req.params._id].find(mongoDB.queryObject).count();
        return resolve({
          message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
          success: true,
          result: mongoDBDocuments ? mongoDBDocuments : [],
          count: docCount ? docCount : 0,
        });
      } catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }

  async createIndex(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let collection = req.params._id;
        let keys = req.body.keys;

        let presentIndex = await database.models[collection].db.collection(collection).listIndexes({}, { key: 1 }).toArray();
        let indexes = presentIndex.map((indexedKeys) => {
          return Object.keys(indexedKeys.key)[0];
        });
        let indexNotPresent = _.differenceWith(keys, indexes);
        if (indexNotPresent.length > 0) {
          indexNotPresent.forEach(async (key) => {
            await database.models[collection].db.collection(collection).createIndex({ [key]: 1 });
          });
          return resolve({
            message: CONSTANTS.apiResponses.KEYS_INDEXED_SUCCESSFULL,
            success: true,
          });
        } else {
          return resolve({
            message: CONSTANTS.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
            success: true,
          });
        }
      } catch (error) {
        return reject({
          status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
          message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
          errorObject: error,
        });
      }
    });
  }
};
