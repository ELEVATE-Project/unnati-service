/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies

const timeZoneDifference = process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC;
const userService = require(PROJECT_ROOT_DIRECTORY + "/generics/services/users");
const programsQueries = require(DB_QUERY_BASE_PATH + "/programs")

/**
 * ProgramsHelper
 * @class
 */
module.exports = class ProgramsHelper {


  /**
   * Set scope in programs
   * @method
   * @name setScope
   * @param {String} programId - program id.
   * @param {Object} scopeData - scope data.
   * @param {String} scopeData.entityType - scope entity type
   * @param {Array} scopeData.entities - scope entities
   * @param {Array} scopeData.roles - roles in scope
   * @returns {JSON} - scope in programs.
   */

  static setScope(programId, scopeData) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsQueries.programsDocument({ _id: programId }, ['_id']);

        if (!programData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let scopeDatas = Object.keys(scopeData);
        let scopeDataIndex = scopeDatas.map((index) => {
          return `scope.${index}`;
        });

        let programIndex = await database.models.programs.listIndexes();
        let indexes = programIndex.map((indexedKeys) => {
          return Object.keys(indexedKeys.key)[0];
        });
        let keysNotIndexed = _.differenceWith(scopeDataIndex, indexes);
        // if (Object.keys(scopeData).length > 0) {
        //   if (scopeData.entityType) {
        //     let bodyData = { name: scopeData.entityType };
        //     let entityTypeData = await entityTypesHelper.list(bodyData);
        //     if (entityTypeData.length > 0) {
        //       currentSolutionScope.entityType = entityTypeData[0].name;
        //     }
        //   }

        //   if (scopeData.entities && scopeData.entities.length > 0) {
        //     //call learners api for search
        //     let entityIds = [];
        //     let locationData = gen.utils.filterLocationIdandCode(scopeData.entities);

        //     if (locationData.codes.length > 0) {
        //       let filterData = {
        //         'registryDetails.code': locationData.codes,
        //         entityType: currentSolutionScope.entityType,
        //       };
        //       let entityDetails = await entitiesHelper.entitiesDocument(filterData);

        //       if (entityDetails.success) {
        //         entityDetails.data.forEach((entity) => {
        //           entityIds.push(entity.id);
        //         });
        //       }
        //     }
        //     entityIds = [...locationData.ids, ...locationData.codes];

        //     if (!entityIds.length > 0) {
        //       return resolve({
        //         status: HTTP_STATUS_CODE.bad_request.status,
        //         message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
        //       });
        //     }

        //     let entitiesData = [];

        //     // if( currentSolutionScope.entityType !== programData[0].scope.entityType ) {
        //     //   let result = [];
        //     //   let childEntities = await userService.getSubEntitiesBasedOnEntityType(currentSolutionScope.entities, currentSolutionScope.entityType, result);
        //     //   if( childEntities.length > 0 ) {
        //     //     entitiesData = entityIds.filter(element => childEntities.includes(element));
        //     //   }
        //     // } else {
        //     entitiesData = entityIds;
        //     // }

        //     if (!entitiesData.length > 0) {
        //       return resolve({
        //         status: HTTP_STATUS_CODE.bad_request.status,
        //         message: CONSTANTS.apiResponses.SCOPE_ENTITY_INVALID,
        //       });
        //     }

        //     currentSolutionScope.entities = entitiesData;
        //   }

        //   // currentSolutionScope.recommendedFor = scopeData.recommendedFor;

        //   // if (scopeData.roles) {
        //   //   if (Array.isArray(scopeData.roles) && scopeData.roles.length > 0) {
        //   //     let userRoles = await userRolesHelper.list(
        //   //       {
        //   //         code: { $in: scopeData.roles },
        //   //       },
        //   //       ['_id', 'code'],
        //   //     );

        //   //     if (!userRoles.length > 0) {
        //   //       return resolve({
        //   //         status: HTTP_STATUS_CODE.bad_request.status,
        //   //         message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
        //   //       });
        //   //     }

        //   //     currentSolutionScope['roles'] = userRoles;
        //   //   } else {
        //   //     if (scopeData.roles === CONSTANTS.common.ALL_ROLES) {
        //   //       currentSolutionScope['roles'] = [
        //   //         {
        //   //           code: CONSTANTS.common.ALL_ROLES,
        //   //         },
        //   //       ];
        //   //     }
        //   //   }
        //   // }
        // }

        if (keysNotIndexed.length > 0) {
          let keysCannotBeAdded = keysNotIndexed.map((keys) => {
            return keys.split('.')[1];
          });
          scopeData = _.omit(scopeData, keysCannotBeAdded);
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            { $set: { scope: scopeData } },
          )
          .lean();

        if (!updateProgram._id) {
          throw {
            status: CONSTANTS.apiResponses.PROGRAM_SCOPE_NOT_ADDED,
          };
        }
        programData = updateProgram;
        let result = { _id: programId, scope: updateProgram.scope };
        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.PROGRAM_UPDATED,
          result: result,
        });
      } catch (error) {
        console.log(error);
        return resolve({
          message: error.message,
          success: false,
        });
      }
    });
  }



 /**
   * Create program
   * @method
   * @name create
   * @param {Array} data
   * @param {Boolean} checkDate this is true for when its called via API calls
   * @returns {JSON} - create program.
   */

 static create(data, checkDate = false, userId="") {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = {
          isDeleted: false,
          status: CONSTANTS.common.ACTIVE_STATUS,
          components: [],
          isAPrivateProgram: data.isAPrivateProgram
            ? data.isAPrivateProgram
            : false,
          owner: userId == "" ? data.userId : userId,
          createdBy: userId == "" ? data.userId : userId,
          updatedBy: userId == "" ? data.userId : userId,
        };

        if (checkDate) {
          if (data.hasOwnProperty("endDate")) {
            data.endDate = UTILS.getEndDate(
              data.endDate,
              timeZoneDifference
            );
          }
          if (data.hasOwnProperty("startDate")) {
            data.startDate = UTILS.getStartDate(
              data.startDate,
              timeZoneDifference
            );
          }
        }

        _.assign(programData, {
          ...data,
        });
        programData = _.omit(programData, ["scope", "userId"]);
        let program = await database.models.programs.create(programData);

        if (!program._id) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_CREATED,
          };
        }


        if (data.scope) {
          let programScopeUpdated = await this.setScope(
            program._id,
            data.scope
          );

          if (!programScopeUpdated.success) {
            throw {
              message: CONSTANTS.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
            };
          }
        }

        return resolve(program);
      } catch (error) {
        return reject(error);
      }
    });
  }



   /**
   * Update program
   * @method
   * @name update
   * @param {String} programId - program id.
   * @param {Array} data
   * @param {String} userId
   * @param {Boolean} checkDate this is true for when its called via API calls
   * @returns {JSON} - update program.
   */

   static update(programId, data, userId, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        data.updatedBy = userId;
        data.updatedAt = new Date();
        //convert components to objectedIds
        if (data.components && data.components.length > 0) {
          data.components = data.components.map((component) =>
            UTILS.convertStringToObjectId(component)
          );
        }

        if (checkDate) {
          if (data.hasOwnProperty("endDate")) {
            data.endDate = UTILS.getEndDate(
              data.endDate,
              timeZoneDifference
            );
          }
          if (data.hasOwnProperty("startDate")) {
            data.startDate = UTILS.getStartDate(
              data.startDate,
              timeZoneDifference
            );
          }
        }
        let program = await database.models.programs.findOneAndUpdate(
          {
            _id: programId,
          },
          { $set: _.omit(data, ["scope"]) },
          { new: true }
        );

        if (!program) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        if (data.scope) {
          let programScopeUpdated = await this.setScope(programId, data.scope);

          if (!programScopeUpdated.success) {
            throw {
              message: CONSTANTS.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM,
            };
          }
        }

        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.PROGRAMS_UPDATED,
          data: {
            _id: programId,
          },
        });
      } catch (error) {
        return resolve({
          success: false,
          message: error.message,
          data: {},
        });
      }
    });
  }

    /**
   * Program details.
   * @method
   * @name details
   * @param {String} programId - Program Id.
   * @returns {Object} - Details of the program.
   */

    static details(programId) {
        return new Promise(async (resolve, reject) => {
          try {
            let programData = await programsQueries.programsDocument({
              _id: programId,
            });
    
            if (!programData.length > 0) {
              return resolve({
                status: HTTP_STATUS_CODE.bad_request.status,
                message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
              });
            }
    
            return resolve({
              message: CONSTANTS.apiResponses.PROGRAMS_FETCHED,
              success: true,
              data: programData[0],
            });
          } catch (error) {
            return resolve({
              success: false,
              status: error.status
                ? error.status
                : HTTP_STATUS_CODE.internal_server_error.status,
              message: error.message,
            });
          }
        });
      }


     /**
   * Add roles in program.
   * @method
   * @name addRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

  static addRolesInScope(programId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsQueries.programsDocument(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let updateQuery = {};

        if (Array.isArray(roles) && roles.length > 0) {
          let currentRoles = await database.models.programs.find(  
            { _id: programId },
            { 'scope.roles': 1, _id: 0 }
            )
            currentRoles = currentRoles[0].scope.roles 

            if(currentRoles[0] == CONSTANTS.common.ALL_ROLES){
              updateQuery["$set"] = {
                "scope.roles": [ CONSTANTS.common.ALL_ROLES ],
              };
            }
            else{
              let currentRolesSet = new Set(currentRoles);
              let rolesSet = new Set(roles);
              
              rolesSet.forEach(role => {
                currentRolesSet.add(role);
              });
              
              currentRoles = Array.from(currentRolesSet);
              updateQuery["$set"] = {
                "scope.roles": currentRoles,
              };
              // updateQuery["$push"] = { "scope.roles": { $each: roles } }
            }           
            
            // console.log(currentRoles, roles)

        } else if (roles === CONSTANTS.common.ALL_ROLES) {
            updateQuery["$set"] = {
              "scope.roles": [CONSTANTS.common.ALL_ROLES],
            };
          
        } else {
          if(roles === ""){
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
            });
          }
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            updateQuery,
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ROLES_ADDED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : HTTP_STATUS_CODE["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }

  /**
   * Add entities in program.
   * @method
   * @name addEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities data.
   * @returns {JSON} - Added entities data.
   */

  static addEntitiesInScope(programId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsQueries.programsDocument(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id", "scope.entities"]
        );

        if (!programData.length > 0) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        // let entityIds = [];
        // let bodyData = {};
        // let locationData = gen.utils.filterLocationIdandCode(entities);

        // if (locationData.ids.length > 0) {
        //   bodyData = {
        //     id: locationData.ids,
        //     type: programData[0].scope.entityType,
        //   };
        //   let entityData = await userService.locationSearch(bodyData);
        //   if (entityData.success) {
        //     entityData.data.forEach((entity) => {
        //       entityIds.push(entity.id);
        //     });
        //   }
        // }

        // if (locationData.codes.length > 0) {
        //   let filterData = {
        //     code: locationData.codes,
        //     type: programData[0].scope.entityType,
        //   };
        //   let entityDetails = await userService.locationSearch(filterData);

        //   if (entityDetails.success) {
        //     entityDetails.data.forEach((entity) => {
        //       entityIds.push(entity.externalId);
        //     });
        //   }
        // }


        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $addToSet: { "scope.entities": { $each: entities } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ENTITIES_ADDED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : HTTP_STATUS_CODE["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }



   /**
   * remove roles in program.
   * @method
   * @name removeRolesInScope
   * @param {String} programId - Program Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

   static removeRolesInScope(programId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsQueries.programsDocument(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id"]
        );

        if (!programData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          });
        }

        let userRoles = await userRolesHelper.roleDocuments(
          {
            code: { $in: roles },
          },
          ["_id", "code"]
        );

        if (!userRoles.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
          });
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $pull: { "scope.roles": { $in: userRoles } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ROLES_REMOVED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : HTTP_STATUS_CODE["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }


   /**
   * remove entities in program scope.
   * @method
   * @name removeEntitiesInScope
   * @param {String} programId - Program Id.
   * @param {Array} entities - entities.
   * @returns {JSON} - Removed entities data.
   */

   static removeEntitiesInScope(programId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programsQueries.programsDocument(
          {
            _id: programId,
            scope: { $exists: true },
            isAPrivateProgram: false,
          },
          ["_id", "scope.entities"]
        );

        if (!programData.length > 0) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          };
        }
        let entitiesData = [];
        entitiesData = programData[0].scope.entities;

        if (!entitiesData.length > 0) {
          throw {
            message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateProgram = await database.models.programs
          .findOneAndUpdate(
            {
              _id: programId,
            },
            {
              $pull: { "scope.entities": { $in: entities } },
            },
            { new: true }
          )
          .lean();

        if (!updateProgram || !updateProgram._id) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ENTITIES_REMOVED_IN_PROGRAM,
          success: true,
        });
      } catch (error) {
        return resolve({
          success: false,
          status: error.status
            ? error.status
            : HTTP_STATUS_CODE["internal_server_error"].status,
          message: error.message,
        });
      }
    });
  }



};
