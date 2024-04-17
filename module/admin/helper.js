/**
 * name : v1.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

module.exports = class Admin{
    static createIndex(collection, keys) {

        return new Promise(async (resolve, reject) => {
            try{
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
            }
            catch(error){
                return resolve({
                    status:
                        error.status ?
                            error.status : HTTP_STATUS_CODE['internal_server_error'].status,
                    success: false,
                    message: error.message,
                    data: {}
                });
            }
        })
        
    }
}