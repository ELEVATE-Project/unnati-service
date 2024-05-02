/**
 * name : admin.js
 * author : prajwal
 * created-date : 23-Apr-2024
 * Description : Admin related db queries
 */

// Dependencies 

/**
    * Programs
    * @class
*/



module.exports= class Admin{
    /**
     * list index.
     * @method
     * @name listIndices
     * @param {String} [collectionName] - collection name.
     * @returns {cursorObject} program details.
     */

    static listIndices(
        collectionName
    ) {
        return new Promise(async (resolve, reject) => {
            try {

               let presentIndices = await database.models[collectionName].listIndexes();
               return resolve(presentIndices);
           } catch (error) {
               return reject(error);
           }
       });
    }

    /**
     * create index
     * @method
     * @name createIndex
     * @param {String} [collectionName] - collection name.
     * @param {String} [key] - key to be indexed
     * @returns {Object} success/failure object
     */

        static createIndex(
            collectionName,
            key
        ) {
            return new Promise(async (resolve, reject) => {
                try {
    
                   let createdIndex = await database.models[collectionName].db.collection(collectionName).createIndex({ [key]: 1 });
                   return resolve(createdIndex);
               } catch (error) {
                   return reject(error);
               }
           });
        }
}