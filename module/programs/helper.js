/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies

const timeZoneDifference = process.env.TIMEZONE_DIFFRENECE_BETWEEN_LOCAL_TIME_AND_UTC;
const userService = require(PROJECT_ROOT_DIRECTORY + "/generics/services/users");

/**
 * ProgramsHelper
 * @class
 */
module.exports = class ProgramsHelper {

     /**
   * Programs Document.
   * @method
   * @name programDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include.
   * @param {Number} pageNo - page no.
   * @param {Number} pageSize - page size.
   * @returns {Array} List of programs.
   */

  static programDocuments(
    filterQuery = "all",
    fieldsArray = "all",
    skipFields = "none",
    pageNo = "",
    pageSize = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = filterQuery != "all" ? filterQuery : {};

        let projection = {};
        let pagination = {};
        if (fieldsArray != "all") {
          fieldsArray.forEach((field) => {
            projection[field] = 1;
          });
        }

        if (skipFields !== "none") {
          skipFields.forEach((field) => {
            projection[field] = 0;
          });
        }
        if (pageNo !== "" && pageSize !== "") {
          pagination = {
            skip: pageSize * (pageNo - 1),
            limit: pageSize,
          };
        }

        let programData = await database.models.programs
          .find(queryObject, projection, pagination)
          .lean();

        return resolve(programData);
      } catch (error) {
        return reject(error);
      }
    });
  }

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
        let programData = await this.programDocuments({ _id: programId }, ['_id']);

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

 static create(data, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = {
          isDeleted: false,
          status: "active",
          components: [],
          isAPrivateProgram: data.isAPrivateProgram
            ? data.isAPrivateProgram
            : false,
          owner: data.userId,
          createdBy: data.userId,
          updatedBy: data.userId,
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
            let programData = await this.programDocuments({
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

};
