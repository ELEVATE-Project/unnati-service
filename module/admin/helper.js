/**
 * name : helper.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

// Dependencies
const adminQueries = require(DB_QUERY_BASE_PATH + "/admin")

module.exports = class Admin{

  /**
   * create index in the model.
   * @method
   * @name createIndex
   * @param {String} collection - collectionName.
   * @param {Array} keys - keys data.
   * @returns {JSON} - success/failure message.
   */
    static createIndex(collection, keys) {

        return new Promise(async (resolve, reject) => {
            try{
                let presentIndex = await adminQueries.listIndices(collection);
                let indexes = presentIndex.map((indexedKeys) => {
                  return Object.keys(indexedKeys.key)[0];
                });
                let indexNotPresent = _.differenceWith(keys, indexes);
                if (indexNotPresent.length > 0) {
                  indexNotPresent.forEach(async (key) => {
                    await adminQueries.createIndex(collection,key)
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
            }
            catch(error){
                return resolve({
                    status:
                        error.status ?
                            error.status : HTTP_STATUS_CODE.internal_server_error.status,
                    success: false,
                    message: error.message,
                    data: {}
                });
            }
        })
        
    }
}