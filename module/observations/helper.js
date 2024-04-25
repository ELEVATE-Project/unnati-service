module.exports = class observationsHelper {
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
    
                let observationDocument = await observationQueries.observationsDocument({
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