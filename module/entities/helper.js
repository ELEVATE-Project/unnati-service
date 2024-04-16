/**
 * name : helper.js
 * author : Ankit Shahu
 * created-date : 16-Jan-2024
 * Description : entities helper functionality.
 */

const userService = require(GENERICS_FILES_PATH + "/services/users");

module.exports = class entitieHelper {

 /**
   * update registry in entities.
   * @method
   * @name listByLocationIds
   * @param {Object} locationIds - locationIds
   * @returns {Object} entity Document
   */

    static listByLocationIds(locationIds) {
        return new Promise(async (resolve, reject) => {
            try {
                //if not uuid considering as location code- for school.
                let locationDeatails = UTILS.filterLocationIdandCode(locationIds);
                //set request body for learners api
                let entityInformation = [];
                let formatResult = true;

                if ( locationDeatails.ids.length > 0 ) {
                    let bodyData = {
                        "id" : locationDeatails.ids
                    } 
                    let entityData = await userService.locationSearch( bodyData, formatResult );
                    if ( entityData.success ) {
                        entityInformation =  entityData.data;
                    }
                }

                if ( locationDeatails.codes.length > 0 ) {
                    let bodyData = {
                        "code" : locationDeatails.codes
                    } 
                    let entityData = await userService.locationSearch( bodyData, formatResult );
                    if ( entityData.success ) {
                        entityInformation =  entityInformation.concat(entityData.data);
                    }
                }

                if ( !entityInformation.length > 0 ) {
                    throw {
                        message : CONSTANTS.apiResponses.ENTITY_NOT_FOUND
                    } 
                }

                return resolve({
                    success : true,
                    message : CONSTANTS.apiResponses.ENTITY_FETCHED,
                    data : entityInformation
                });

            } catch(error) {
                return resolve({
                    success : false,
                    message : error.message
                });
            }
        })
    }


      /**
     * Get Observation document based on filtered data provided.
     * @method
     * @name observationDocuments
     * @param {Object} [findQuery = "all"] -filter data.
     * @param {Array} [fields = "all"] - Projected fields.
     * @returns {Array} - List of observations.
     */

      static observationDocuments(findQuery = "all", fields = "all") {
        return new Promise(async (resolve, reject) => {
            try {
                let queryObject = {};

                if (findQuery != "all") {
                    queryObject = _.merge(queryObject, findQuery)
                }

                let projectionObject = {};

                if (fields != "all") {
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                let observationDocuments = await database.models.observations
                    .find(queryObject, projectionObject)
                    .lean();

                return resolve(observationDocuments);
            } catch (error) {
                return reject(error);
            }
        });
    }



     /**
   * Implement find query for entity
   * @method
   * @name entityDocuments
   * @param {Object} [findQuery = "all"] - filter query object if not provide 
   * it will load all the document.
   * @param {Array} [fields = "all"] - All the projected field. If not provided
   * returns all the field
   * @param {Number} [limitingValue = ""] - total data to limit.
   * @param {Number} [skippingValue = ""] - total data to skip.
   * @returns {Array} - returns an array of entities data.
   */

     static entityDocuments(findQuery = "all", fields = "all", limitingValue = "", skippingValue = "",sortedData = "") {
        return new Promise(async (resolve, reject) => {
            try {
                let queryObject = {};

                if (findQuery != "all") {
                    queryObject = findQuery;
                }

                let projectionObject = {};

                if (fields != "all") {
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                let entitiesDocuments;

                if( sortedData !== "" ) {
                entitiesDocuments = await database.models.entities
                    .find(queryObject, projectionObject)
                    .sort(sortedData)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                } else {
                    entitiesDocuments = await database.models.entities
                    .find(queryObject, projectionObject)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                }
                
                return resolve(entitiesDocuments);
            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message,
                    errorObject: error
                });
            }
        });
    }


       /**
      * observation details.
      * @method
      * @name details
      * @param  {String} observationId observation id.
      * @returns {details} observation details.
     */

   static details(userToken, observationId) {
    return new Promise(async (resolve, reject) => {
        try {

            let observationDocument = await this.observationDocuments({
                _id:observationId
            });

            if(!observationDocument[0]) {
                throw new Error(CONSTANTS.apiResponses.OBSERVATION_NOT_FOUND);
            }

            if(observationDocument[0].entities.length>0) {

                let entitiesDocument = await this.entityDocuments({
                    _id:{$in:observationDocument[0].entities}
                });

                observationDocument[0]["count"] = entitiesDocument.length;
                observationDocument[0].entities = entitiesDocument;
            }

            return resolve(observationDocument[0]);

        }
        catch (error) {
            return reject(error);
        }
    })
}

}