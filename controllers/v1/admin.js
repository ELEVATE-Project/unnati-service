/**
 * name : admin.js
 * author : Prajwal
 * created-date : 04-Apr-2024
 * Description : Admin related information.
 */

// Dependencies

/**
   * Reports
   * @admin
*/

module.exports = class Admin {

    static get name() {
        return "admin";
    }

    async createIndex(req) {
        return new Promise(async (resolve, reject) => {
          try {
            let collection = req.params._id;
            let keys = req.body.keys;
    
            let presentIndex = await database.models[collection].listIndexes();
            let indexes = presentIndex.map((indexedKeys) => {
              return Object.keys(indexedKeys.key)[0];
            });
            let indexNotPresent = _.differenceWith(keys, indexes);
            if (indexNotPresent.length > 0) {
              indexNotPresent.forEach(async (key) => {
                await database.models.solutions.db.collection(collection).createIndex({ [key]: 1 });
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
    

}