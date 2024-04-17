/**
 * name : admin.js
 * author : Prajwal
 * created-date : 04-Apr-2024
 * Description : Admin related information.
 */

// Dependencies
const adminHelper = require(MODULES_BASE_PATH + "/admin/helper");

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

          const fieldIndexed = await adminHelper.createIndex(
            collection,
            keys
          ) 

          return resolve(fieldIndexed)
  

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