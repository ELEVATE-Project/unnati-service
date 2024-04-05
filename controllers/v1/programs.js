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
  
          req.body.userId = req.userDetails.userId;
          let programCreationData = await programsHelper.create(
            req.body,
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
        
    static get name() {
      return "programs";
    }
}