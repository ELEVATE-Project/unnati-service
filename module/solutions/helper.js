/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Solution related helper functionality.
 */

// Dependencies

const solutionsQueries = require(DB_QUERY_BASE_PATH + "/solutions");
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper")
const programQueries = require(DB_QUERY_BASE_PATH + "/programs")
const userService = require(GENERICS_FILES_PATH + "/services/users")
const validateEntity = process.env.VALIDATE_ENTITIES
const appsPortalBaseUrl = process.env.APP_PORTAL_BASE_URL + "/"

/**
    * SolutionsHelper
    * @class
*/
module.exports = class SolutionsHelper {

  /**
 * Generate solution creation data.
 * @method
 * @name _createSolutionData
 * @returns {Object} - solution creation data
 */

static _createSolutionData(
  name = "",
  externalId = "",
  isAPrivateProgram = "",
  status,
  description = "",
  userId,
  isReusable = "",
  parentSolutionId = "",
  type = "",
  subType = "",
  updatedBy = "",
  projectTemplateId = ""
) {
  let solutionData = {};
  solutionData.name = name;
  solutionData.externalId = externalId;
  solutionData.isAPrivateProgram = isAPrivateProgram;
  solutionData.status = status;
  solutionData.description = description;
  solutionData.author = userId;
  if (parentSolutionId) {
    solutionData.parentSolutionId = parentSolutionId;
  }
  if (type) {
    solutionData.type = type;
  }
  if (subType) {
    solutionData.subType = subType;
  }
  if (updatedBy) {
    solutionData.updatedBy = updatedBy;
  }
  if (isReusable) {
    solutionData.isReusable = isReusable;
  }
  if (projectTemplateId) {
    solutionData.projectTemplateId = projectTemplateId;
  }

  return solutionData;
}

  /**
 * Generate program creation data.
 * @method
 * @name _createProgramData
 * @returns {Object} - program creation data
 */

  static _createProgramData(
    name,
    externalId,
    isAPrivateProgram,
    status,
    description,
    userId,
    startDate,
    endDate,
    createdBy = ""
  ) {
    let programData = {};
    programData.name = name;
    programData.externalId = externalId;
    programData.isAPrivateProgram = isAPrivateProgram;
    programData.status = status;
    programData.description = description;
    programData.userId = userId;
    programData.createdBy = createdBy;
    programData.startDate = startDate;
    programData.endDate = endDate;
    return programData;
  }


      /**
     * Set scope in solution
     * @method
     * @name setScope
     * @param {String} solutionId - solution id.
     * @param {Object} scopeData - scope data.
     * @param {String} scopeData.entityType - scope entity type
     * @param {Array} scopeData.entities - scope entities
     * @param {Array} scopeData.roles - roles in scope
     * @returns {JSON} - scope in solution.
     */



    static setScope(solutionId, scopeData) {
      return new Promise(async (resolve, reject) => {
        try {
          let solutionData = await solutionsQueries.solutionsDocument({ _id: solutionId }, ['_id']);
  
          if (!solutionData.length > 0) {
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
            });
          }
  
          // let currentSolutionScope = {};
          let scopeDatas = Object.keys(scopeData);
          let scopeDataIndex = scopeDatas.map((index) => {
            return `scope.${index}`;
          });
  
          let solutionIndex = await database.models.solutions.listIndexes();
          let indexes = solutionIndex.map((indexedKeys) => {
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
  
          let updateSolution = await database.models.solutions
            .findOneAndUpdate(
              {
                _id: solutionId,
              },
              { $set: { scope: scopeData } },
              // { new: true },
            )
            .lean();
  
          if (!updateSolution._id) {
            throw {
              status: CONSTANTS.apiResponses.SOLUTION_SCOPE_NOT_ADDED,
            };
          }
          solutionData = updateSolution;
          let result = { _id: solutionId, scope: updateSolution.scope };
          return resolve({
            success: true,
            message: CONSTANTS.apiResponses.SOLUTION_UPDATED,
            result: result,
          });
        } catch (error) {
          return resolve({
            message: error.message,
            success: false,
          });
        }
      });
    }

  /**
   * Create solution.
   * @method
   * @name createSolution
   * @param {Object} solutionData - solution creation data.
   * @returns {JSON} solution creation data.
   */

  static createSolution(solutionData, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let programData = await programQueries.programsDocument(
          {
            externalId: solutionData.programExternalId,
          },
          ["name", "description", "scope", "endDate", "startDate"]
        );

        if (!programData.length > 0) {
          throw {
            message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
          };
        }

        solutionData.programId = programData[0]._id;
        solutionData.programName = programData[0].name;
        solutionData.programDescription = programData[0].description;

        if (
          solutionData.type == CONSTANTS.common.COURSE &&
          !solutionData.link
        ) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.COURSE_LINK_REQUIRED,
          });
        }

        // if (solutionData.entities && solutionData.entities.length > 0) {
        //   let entityIds = [];
        //   let locationData = gen.utils.filterLocationIdandCode(
        //     solutionData.entities
        //   );

        //   if (locationData.ids.length > 0) {
        //     let bodyData = {
        //       id: locationData.ids,
        //     };
        //     let entityData = await userService.locationSearch(bodyData);
        //     if (entityData.success) {
        //       entityData.data.forEach((entity) => {
        //         entityIds.push(entity.id);
        //       });
        //     }
        //   }

        //   if (locationData.codes.length > 0) {
        //     let filterData = {
        //       externalId: locationData.codes,
        //     };
        //     let schoolDetails = await userService.orgSchoolSearch(filterData);

        //     if (schoolDetails.success) {
        //       let schoolData = schoolDetails.data;
        //       schoolData.forEach((entity) => {
        //         entityIds.push(entity.externalId);
        //       });
        //     }
        //   }

        //   if (!entityIds.length > 0) {
        //     throw {
        //       message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
        //     };
        //   }

        //   solutionData.entities = entityIds;
        // }

        if (
          solutionData.minNoOfSubmissionsRequired &&
          solutionData.minNoOfSubmissionsRequired >
            CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
        ) {
          if (!solutionData.allowMultipleAssessemts) {
            solutionData.minNoOfSubmissionsRequired =
              CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED;
          }
        }

        solutionData.status = CONSTANTS.common.ACTIVE_STATUS;

        if (checkDate) {
          if (solutionData.hasOwnProperty("endDate")) {
            solutionData.endDate = UTILS.getEndDate(
              solutionData.endDate,
              timeZoneDifference
            );
            if (solutionData.endDate > programData[0].endDate) {
              solutionData.endDate = programData[0].endDate;
            }
          }
          if (solutionData.hasOwnProperty("startDate")) {
            solutionData.startDate = UTILS.getStartDate(
              solutionData.startDate,
              timeZoneDifference
            );
            if (solutionData.startDate < programData[0].startDate) {
              solutionData.startDate = programData[0].startDate;
            }
          }
        }

        let solutionCreation = await database.models.solutions.create(
          _.omit(solutionData, ["scope"])
        );

        if (!solutionCreation._id) {
          throw {
            message: CONSTANTS.apiResponses.SOLUTION_NOT_CREATED,
          };
        }

        let updateProgram = await database.models.programs.updateOne(
          {
            _id: solutionData.programId,
          },
          {
            $addToSet: { components: solutionCreation._id },
          }
        );

        if (!solutionData.excludeScope && programData[0].scope) {
          let solutionScope = await this.setScope(
            solutionCreation._id,
            solutionData.scope ? solutionData.scope : {}
          );
        }

        return resolve({
          message: CONSTANTS.apiResponses.SOLUTION_CREATED,
          data: {
            result : {
              _id: solutionCreation._id,
            }
          },
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

   /**
   * Update solution.
   * @method
   * @name update
   * @param {String} solutionId - solution id.
   * @param {Object} solutionData - solution creation data.
   * @returns {JSON} solution creation data.
   */

   static update(solutionId, solutionData, userId, checkDate = false) {
    return new Promise(async (resolve, reject) => {
      try {
        let queryObject = {
          _id: solutionId,
        };

        let solutionDocument = await solutionsQueries.solutionsDocument(queryObject, [
          "_id",
          "programId",
        ]);

        if (!solutionDocument.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        if (
          checkDate &&
          (solutionData.hasOwnProperty(CONSTANTS.common.END_DATE) ||
            solutionData.hasOwnProperty(CONSTANTS.common.END_DATE))
        ) {
          let programData = await programQueries.programsDocument(
            {
              _id: solutionDocument[0].programId,
            },
            ["_id", "endDate", "startDate"]
          );

          if (!programData.length > 0) {
            throw {
              message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
            };
          }
          if (solutionData.hasOwnProperty(CONSTANTS.common.END_DATE)) {
            solutionData.endDate = UTILS.getEndDate(
              solutionData.endDate,
              timeZoneDifference
            );
            if (solutionData.endDate > programData[0].endDate) {
              solutionData.endDate = programData[0].endDate;
            }
          }
          if (solutionData.hasOwnProperty(CONSTANTS.common.START_DATE)) {
            solutionData.startDate = UTILS.getStartDate(
              solutionData.startDate,
              timeZoneDifference
            );
            if (solutionData.startDate < programData[0].startDate) {
              solutionData.startDate = programData[0].startDate;
            }
          }
        }

        let updateObject = {
          $set: {},
        };

        if (
          solutionData.minNoOfSubmissionsRequired &&
          solutionData.minNoOfSubmissionsRequired >
            CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED
        ) {
          if (!solutionData.allowMultipleAssessemts) {
            solutionData.minNoOfSubmissionsRequired =
              CONSTANTS.common.DEFAULT_SUBMISSION_REQUIRED;
          }
        }

        let solutionUpdateData = solutionData;

        Object.keys(_.omit(solutionUpdateData, ["scope"])).forEach(
          (updationData) => {
            updateObject["$set"][updationData] =
              solutionUpdateData[updationData];
          }
        );

        updateObject["$set"]["updatedBy"] = userId;
        let solutionUpdatedData = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionDocument[0]._id,
            },
            updateObject,
            { new: true }
          )
          .lean();

        if (!solutionUpdatedData._id) {
          throw {
            message: CONSTANTS.apiResponses.SOLUTION_NOT_CREATED,
          };
        }

        if (solutionData.scope && Object.keys(solutionData.scope).length > 0) {
          let solutionScope = await this.setScope(
            solutionUpdatedData._id,
            solutionData.scope
          );

          if (!solutionScope.success) {
            throw {
              message: CONSTANTS.apiResponses.COULD_NOT_UPDATE_SCOPE,
            };
          }
        }

        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.SOLUTION_UPDATED,
          data: solutionData,
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
   * List solutions.
   * @method
   * @name list
   * @param {String} type - solution type.
   * @param {String} subType - solution sub type.
   * @param {Number} pageNo - page no.
   * @param {Number} pageSize - page size.
   * @param {String} searchText - search text.
   * @param {Object} filter - Filtered data.
   * @returns {JSON} List of solutions.
   */

   static list(
    type,
    subType,
    filter = {},
    pageNo,
    pageSize,
    searchText,
    projection
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let matchQuery = {
          isDeleted: false,
        };

        if (type == CONSTANTS.common.SURVEY) {
          matchQuery["status"] = {
            $in: [CONSTANTS.common.ACTIVE_STATUS, CONSTANTS.common.INACTIVE],
          };
        } else {
          matchQuery.status = CONSTANTS.common.ACTIVE_STATUS;
        }

        if (type !== "") {
          matchQuery["type"] = type;
        }

        if (subType !== "") {
          matchQuery["subType"] = subType;
        }

        if (Object.keys(filter).length > 0) {
          matchQuery = _.merge(matchQuery, filter);
        }

        let searchData = [
          {
            name: new RegExp(searchText, "i"),
          },
          {
            externalId: new RegExp(searchText, "i"),
          },
          {
            description: new RegExp(searchText, "i"),
          },
        ];

        if (searchText !== "") {
          if (matchQuery["$or"]) {
            matchQuery["$and"] = [{ $or: matchQuery.$or }, { $or: searchData }];

            delete matchQuery.$or;
          } else {
            matchQuery["$or"] = searchData;
          }
        }

        let projection1 = {};

        if (projection) {
          projection.forEach((projectedData) => {
            projection1[projectedData] = 1;
          });
        } else {
          projection1 = {
            description: 1,
            externalId: 1,
            name: 1,
          };
        }

        let facetQuery = {};
        facetQuery["$facet"] = {};

        facetQuery["$facet"]["totalCount"] = [{ $count: "count" }];

        facetQuery["$facet"]["data"] = [
          { $skip: pageSize * (pageNo - 1) },
          { $limit: pageSize },
        ];

        let projection2 = {};

        projection2["$project"] = {
          data: 1,
          count: {
            $arrayElemAt: ["$totalCount.count", 0],
          },
        };

        let solutionDocuments = await database.models.solutions.aggregate([
          { $match: matchQuery },
          {
            $sort: { updatedAt: -1 },
          },
          { $project: projection1 },
          facetQuery,
          projection2,
        ]);

        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.SOLUTIONS_LIST,
          data: {
            result : solutionDocuments[0]
          }
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
  * Update User District and Organisation In Solutions For Reporting.
  * @method
  * @name _addReportInformationInSolution 
  * @param {String} solutionId - solution id.
  * @param {Object} userProfile - user profile details
  * @returns {Object} Solution information.
*/

  static addReportInformationInSolution(solutionId,userProfile) {
    return new Promise(async (resolve, reject) => {
        try {

            //check solution & userProfile is exist
            if ( 
                solutionId && userProfile && 
                userProfile["userLocations"] && 
                userProfile["organisations"]
            ) {
                let district = [];
                let organisation = [];

                //get the districts from the userProfile
                for (const location of userProfile["userLocations"]) {
                    if ( location.type == CONSTANTS.common.DISTRICT ) {
                        let distData = {}
                        distData["locationId"] = location.id;
                        distData["name"] = location.name;
                        district.push(distData);
                    }
                }

                //get the organisations from the userProfile
                for (const org of userProfile["organisations"]) {
                    if ( !org.isSchool ) {
                        let orgData = {};
                        orgData.orgName = org.orgName;
                        orgData.organisationId = org.organisationId;
                        organisation.push(orgData);
                    }
                    
                }

                let updateQuery = {};
                updateQuery["$addToSet"] = {};
  
                if ( organisation.length > 0 ) {
                    updateQuery["$addToSet"]["reportInformation.organisations"] = { $each : organisation};
                }

                if ( district.length > 0 ) {
                    updateQuery["$addToSet"]["reportInformation.districts"] = { $each : district};
                }

                //add user district and organisation in solution
                if ( updateQuery["$addToSet"] && Object.keys(updateQuery["$addToSet"].length > 0)) {
                    await solutionsQueries.updateSolutionDocument
                    (
                        { _id : solutionId },
                        updateQuery
                    )
                }
                
            } else {
                throw new Error(CONSTANTS.apiResponses.SOLUTION_ID_AND_USERPROFILE_REQUIRED);
            }
            
            return resolve({
                success: true,
                message: CONSTANTS.apiResponses.UPDATED_DOCUMENT_SUCCESSFULLY
            });
            
        } catch (error) {
            return resolve({
              success : false,
              message : error.message,
              data: []
            });
        }
    });
  }


   /**
   * Add roles in solution scope.
   * @method
   * @name addRolesInScope
   * @param {String} solutionId - Solution Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Added roles data.
   */

   static addRolesInScope(solutionId, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsQueries.solutionsDocument(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let updateQuery = {};

        if (Array.isArray(roles) && roles.length > 0) {
          let currentRoles = await database.models.solutions.find(  
            { _id: solutionId },
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



        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            updateQuery,
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: CONSTANTS.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ROLES_ADDED_IN_SOLUTION,
          success: true,
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
   * Auto targeted query field.
   * @method
   * @name queryBasedOnRoleAndLocation
   * @param {String} data - Requested body data.
   * @returns {JSON} - Auto targeted solutions query.
   */

    static queryBasedOnRoleAndLocation(data, type = "") {
      return new Promise(async (resolve, reject) => {
        try {
          let entities = [];
          let entityTypes = [];
          let filterQuery = {
            isReusable: false,
            isDeleted: false,
          }
  
          if(validateEntity !== CONSTANTS.common.OFF){
            Object.keys(_.omit(data, ["filter", "role"])).forEach(
              (requestedDataKey) => {
                entities.push(data.entities);
                entityTypes.push(data.entityType);
              }
            );
            if (!entities.length > 0) {
              throw {
                message: CONSTANTS.apiResponses.NO_LOCATION_ID_FOUND_IN_DATA,
              };
            }
  
            filterQuery["scope.roles"] = {
                $in: [CONSTANTS.common.ALL_ROLES, ...data.role.split(",")],
              }
            filterQuery["scope.entities"]= { $in: entities }
            filterQuery["scope.entityType"]= { $in: entityTypes }
          }else{
            let userRoleInfo = _.omit(data, ['filter'])
            let userRoleKeys = Object.keys(userRoleInfo);
            userRoleKeys.forEach(entities => {
              filterQuery["scope."+entities] = {$in:userRoleInfo[entities].split(",")}
            });
          }
  
          if (type === CONSTANTS.common.SURVEY) {
            filterQuery["status"] = {
              $in: [CONSTANTS.common.ACTIVE_STATUS, CONSTANTS.common.INACTIVE],
            };
            let validDate = new Date();
            validDate.setDate(
              validDate.getDate() - CONSTANTS.common.DEFAULT_SURVEY_REMOVED_DAY
            );
            filterQuery["endDate"] = { $gte: validDate };
          } else {
            filterQuery.status = CONSTANTS.common.ACTIVE_STATUS;
          }
  
          if (data.filter && Object.keys(data.filter).length > 0) {
            let solutionsSkipped = [];
  
            if (data.filter.skipSolutions) {
              data.filter.skipSolutions.forEach((solution) => {
                solutionsSkipped.push(ObjectId(solution.toString()));
              });
  
              data.filter["_id"] = {
                $nin: solutionsSkipped,
              };
  
              delete data.filter.skipSolutions;
            }
  
            filterQuery = _.merge(filterQuery, data.filter);
          }
  
          return resolve({
            success: true,
            data: filterQuery,
          });
        } catch (error) {
          return resolve({
            success: false,
            status: error.status
              ? error.status
              : HTTP_STATUS_CODE.internal_server_error.status,
            message: error.message,
            data: {},
          });
        }
      });
    }





    /**
   * Verify solution id
   * @method
   * @name verifySolution
   * @param {String} solutionId - solution Id.
   * @param {String} userId - user Id.
   * @param {String} userToken - user token.
   * @param {Boolean} createProject - create project.
   * @param {Object} bodyData - Req Body.
   * @returns {Object} - Details of the solution.
   * Takes SolutionId and userRoleInformation as parameters.
   * @return {Object} - {
    "message": "Solution is not targeted to the role",
    "status": 200,
    "result": {
        "isATargetedSolution": false/true,
        "_id": "63987b5d26a3620009a1142d"
    }
  }
   */

  static isTargetedBasedOnUserProfile(solutionId = "", bodyData = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          isATargetedSolution: false,
          _id: solutionId,
        };

        let queryData = await this.queryBasedOnRoleAndLocation(bodyData);
        if (!queryData.success) {
          return resolve(queryData);
        }

        queryData.data["_id"] = solutionId;
        let matchQuery = queryData.data;
        let solutionData = await solutionsQueries.solutionsDocument(matchQuery, [
          "_id",
          "type",
          "programId",
          "name",
        ]);

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            success: true,
            message:
              CONSTANTS.apiResponses.SOLUTION_NOT_FOUND_OR_NOT_A_TARGETED,
            result: response,
          });
        }

        response.isATargetedSolution = true;
        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.SOLUTION_DETAILS_VERIFIED,
          result: response,
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
   * Details of solution based on role and location.
   * @method
   * @name detailsBasedOnRoleAndLocation
   * @param {String} solutionId - solution Id.
   * @param {Object} bodyData - Requested body data.
   * @returns {JSON} - Details of solution based on role and location.
   */

    static detailsBasedOnRoleAndLocation(solutionId, bodyData, type = "", userToken="") {
      return new Promise(async (resolve, reject) => {
        try {
          let queryData = await this.queryBasedOnRoleAndLocation(bodyData, type);
  
          if (!queryData.success) {
            return resolve(queryData);
          }
  
          queryData.data["_id"] = solutionId;
          let targetedSolutionDetails = await solutionsQueries.solutionsDocument(
            queryData.data,
            [
              "name",
              "externalId",
              "description",
              "programId",
              "programName",
              "programDescription",
              "programExternalId",
              "isAPrivateProgram",
              "projectTemplateId",
              "entityType",
              "entityTypeId",
              "language",
              "creator",
              "link",
              "certificateTemplateId",
              "endDate",
            ]
          );
  
          if (!targetedSolutionDetails.length > 0) {
            throw {
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
            };
          }
  
          return resolve({
            success: true,
            message: CONSTANTS.apiResponses.TARGETED_SOLUTIONS_FETCHED,
            result : targetedSolutionDetails[0]
          });
        } catch (error) {
          return resolve({
            success: false,
            message: error.message,
            data: {},
            status: error.status,
          });
        }
      });
    }


      /**
   * Create user program and solution
   * @method
   * @name createProgramAndSolution
   * @param {string} userId - logged in user Id.
   * @param {object} programData - data needed for creation of program.
   * @param {object} solutionData - data needed for creation of solution.
   * @returns {Array} - Created user program and solution.
   */

  static createProgramAndSolution(
    userId,
    data,
    userToken,
    createADuplicateSolution = ""
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        let userPrivateProgram = {};
        let dateFormat = gen.utils.epochTime();
        let parentSolutionInformation = {};

        createADuplicateSolution = UTILS.convertStringToBoolean(
          createADuplicateSolution
        );
        //program part
        if (data.programId && data.programId !== "") {
          let filterQuery = {
            _id: data.programId,
          };

          if (createADuplicateSolution === false) {
            filterQuery.createdBy = userId;
          }

          let checkforProgramExist = await programQueries.programsDocument(
            filterQuery,
            "all",
            ["__v"]
          );

          if (!checkforProgramExist.length > 0) {
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
              result: {},
            });
          }

          if (createADuplicateSolution === true) {
            let duplicateProgram = checkforProgramExist[0];
            duplicateProgram = await _createProgramData(
              duplicateProgram.name,
              duplicateProgram.externalId
                ? duplicateProgram.externalId + "-" + dateFormat
                : duplicateProgram.name + "-" + dateFormat,
              true,
              CONSTANTS.common.ACTIVE,
              duplicateProgram.description,
              userId,
              duplicateProgram.startDate,
              duplicateProgram.endDate,
              userId
            );
            // set rootorganisation from parent program
            if (checkforProgramExist[0].hasOwnProperty("rootOrganisations")) {
              duplicateProgram.rootOrganisations =
                checkforProgramExist[0].rootOrganisations;
            }
            if (
              checkforProgramExist[0].hasOwnProperty("requestForPIIConsent")
            ) {
              duplicateProgram.requestForPIIConsent =
                checkforProgramExist[0].requestForPIIConsent;
            }
            userPrivateProgram = await programsHelper.create(
              _.omit(duplicateProgram, ["_id", "components", "scope"])
            );
          } else {
            userPrivateProgram = checkforProgramExist[0];
          }
        } else {
          /* If the programId is not passed from the front end, we will enter this else block. 
          In this block, we need to provide the necessary basic details to create a new program, Including startDate and endDate.*/
          // Current date
          let startDate = new Date();
          // Add one year to the current date
          let endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          let programData = await _createProgramData(
            data.programName,
            data.programExternalId
              ? data.programExternalId
              : data.programName + "-" + dateFormat,
            true,
            CONSTANTS.common.ACTIVE,
            data.programDescription
              ? data.programDescription
              : data.programName,
            userId,
            startDate,
            endDate
          );

          if (data.rootOrganisations) {
            programData.rootOrganisations = data.rootOrganisations;
          }
          userPrivateProgram = await programsHelper.create(programData);
        }

        let solutionDataToBeUpdated = {
          programId: userPrivateProgram._id,
          programExternalId: userPrivateProgram.externalId,
          programName: userPrivateProgram.name,
          programDescription: userPrivateProgram.description,
          isAPrivateProgram: userPrivateProgram.isAPrivateProgram,
        };

        //entities
        if (
          Array.isArray(data.entities) &&
          data.entities &&
          data.entities.length > 0
        ) {
          let entitiesData = [];
          let bodyData = {};

          let locationData = UTILS.filterLocationIdandCode(data.entities);

          if (locationData.ids.length > 0) {
            bodyData = {
              id: locationData.ids,
            };
            let entityData = await userService.locationSearch(bodyData);

            if (!entityData.success) {
              return resolve({
                status: HTTP_STATUS_CODE.bad_request.status,
                message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
                result: {},
              });
            }

            entityData.data.forEach((entity) => {
              entitiesData.push(entity.id);
            });

            solutionDataToBeUpdated["entityType"] = entityData.data[0].type;
          }

          if (locationData.codes.length > 0) {
            let filterData = {
              code: locationData.codes,
            };
            let entityDetails = await userService.locationSearch(filterData);
            let entityDocuments = entityDetails.data;
            if (!entityDetails.success || !entityDocuments.length > 0) {
              return resolve({
                status: HTTP_STATUS_CODE.bad_request.status,
                message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
                result: {},
              });
            }

            entityDocuments.forEach((entity) => {
              entitiesData.push(entity.id);
            });

            solutionDataToBeUpdated["entityType"] = CONSTANTS.common.SCHOOL;
          }

          if (data.type && data.type !== CONSTANTS.common.IMPROVEMENT_PROJECT) {
            solutionDataToBeUpdated["entities"] = entitiesData;
          }
        }

        //solution part
        let solution = "";
        if (data.solutionId && data.solutionId !== "") {
          let solutionData = await solutionsQueries.solutionsDocument(
            {
              _id: data.solutionId,
            },
            [
              "name",
              "link",
              "type",
              "subType",
              "externalId",
              "description",
              "certificateTemplateId",
              "projectTemplateId",
            ]
          );

          if (!solutionData.length > 0) {
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
              result: {},
            });
          }

          if (createADuplicateSolution === true) {
            let duplicateSolution = solutionData[0];
            let solutionCreationData = await _createSolutionData(
              duplicateSolution.name,
              duplicateSolution.externalId
                ? duplicateSolution.externalId + "-" + dateFormat
                : duplicateSolution.name + "-" + dateFormat,
              true,
              CONSTANTS.common.ACTIVE,
              duplicateSolution.description,
              userId,
              false,
              duplicateSolution._id,
              duplicateSolution.type,
              duplicateSolution.subType,
              userId,
              duplicateSolution.projectTemplateId
            );

            _.merge(duplicateSolution, solutionCreationData);
            _.merge(duplicateSolution, solutionDataToBeUpdated);

            solution = await this.create(
              _.omit(duplicateSolution, ["_id", "link"])
            );
            parentSolutionInformation.solutionId = duplicateSolution._id;
            parentSolutionInformation.link = duplicateSolution.link;
          } else {
            if (solutionData[0].isReusable === false) {
              return resolve({
                status: HTTP_STATUS_CODE.bad_request.status,
                message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
                result: {},
              });
            }

            solution = await database.models.solutions.findOneAndUpdate(
              {
                _id: solutionData[0]._id,
              },
              {
                $set: solutionDataToBeUpdated,
              },
              {
                new: true,
              }
            );
          }
        } else {
          let externalId, description;
          if (data.solutionName) {
            externalId = data.solutionExternalId
              ? data.solutionExternalId
              : data.solutionName + "-" + dateFormat;
            description = data.solutionDescription
              ? data.solutionDescription
              : data.solutionName;
          } else {
            externalId = userId + "-" + dateFormat;
            description = userPrivateProgram.programDescription;
          }

          let createSolutionData = await _createSolutionData(
            data.solutionName
              ? data.solutionName
              : userPrivateProgram.programName,
            externalId,
            userPrivateProgram.isAPrivateProgram,
            CONSTANTS.common.ACTIVE,
            description,
            "",
            false,
            "",
            data.type ? data.type : CONSTANTS.common.ASSESSMENT,
            data.subType ? data.subType : CONSTANTS.common.INSTITUTIONAL,
            userId
          );
          _.merge(solutionDataToBeUpdated, createSolutionData);
          solution = await this.create(solutionDataToBeUpdated);
        }

        if (solution && solution._id) {
         let updatedProgram = await programQueries.findAndUpdate(
            {
              _id: userPrivateProgram._id,
            },
            {
              $addToSet: { components: ObjectId(solution._id) },
            },
            {
              new : true
            }
          );
        }

        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
          result: {
            program: userPrivateProgram,
            solution: solution,
            parentSolutionInformation: parentSolutionInformation,
          },
        });
      } catch (error) {
        return reject(error);
      }
    });
  }




   /**
   * remove roles from solution scope.
   * @method
   * @name removeRolesInScope
   * @param {String} solutionId - Solution Id.
   * @param {Array} roles - roles data.
   * @returns {JSON} - Removed solution roles.
   */

   static removeRolesInScope(solutionId, roles) {
    return new Promise(async (resolve, reject) => {
      try {

        if (!roles.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.INVALID_ROLE_CODE,
          });
        }
        let solutionData = await solutionsQueries.solutionsDocument(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
          });
        }

        let updateSolution = await solutionsQueries.updateSolutionDocument(
          {
            _id: solutionId,
          },
          {
            $pull: { "scope.roles": { $in: roles } },
          },
          { new: true }
        )

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: CONSTANTS.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ROLES_REMOVED_IN_SOLUTION,
          success: true,
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
 * Generate sharing Link.
 * @method
 * @name _targetedSolutionTypes
 * @returns {Array} - Targeted solution types
 */

static _generateLink(appsPortalBaseUrl, prefix, solutionLink, solutionType) {
  let link;

  switch (solutionType) {
    case CONSTANTS.common.OBSERVATION:
      link =
        appsPortalBaseUrl +
        prefix +
        CONSTANTS.common.CREATE_OBSERVATION +
        solutionLink;
      break;
    case CONSTANTS.common.IMPROVEMENT_PROJECT:
      link =
        appsPortalBaseUrl +
        prefix +
        CONSTANTS.common.CREATE_PROJECT +
        solutionLink;
      break;
    default:
      link =
        appsPortalBaseUrl +
        prefix +
        CONSTANTS.common.CREATE_SURVEY +
        solutionLink;
  }

  return link;
}



   /**
   * Get link by solution id
   * @method
   * @name fetchLink
   * @param {String} solutionId - solution Id.
   * @param {String} userId - user Id.
   * @returns {Object} - Details of the solution.
   */

   static fetchLink(solutionId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsQueries.solutionsDocument(
          {
            _id: solutionId,
            isReusable: false,
            isAPrivateProgram: false,
          },
          ["link", "type", "author"]
        );

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
            result: {},
          });
        }

        let prefix = CONSTANTS.common.PREFIX_FOR_SOLUTION_LINK;

        let solutionLink, link;

        if (!solutionData[0].link) {
          let updateLink = await UTILS.md5Hash(
            solutionData[0]._id + "###" + solutionData[0].author
          );

          let updateSolution = await this.update(
            solutionId,
            { link: updateLink },
            userId
          );

          solutionLink = updateLink;
        } else {
          solutionLink = solutionData[0].link;
        }

        link = this._generateLink(
          appsPortalBaseUrl,
          prefix,
          solutionLink,
          solutionData[0].type
        );

        return resolve({
          success: true,
          message: CONSTANTS.apiResponses.LINK_GENERATED,
          result: link,
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
   * Verify Solution details.
   * @method
   * @name verifySolutionDetails
   * @param {String} solutionId - Program Id.
   * @returns {Object} - Details of the solution.
   */

   static verifySolutionDetails(link = "", userId = "", userToken = "") {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          verified: false,
        };

        if (userToken == "") {
          throw new Error(CONSTANTS.apiResponses.REQUIRED_USER_AUTH_TOKEN);
        }

        if (userId == "") {
          throw new Error(CONSTANTS.apiResponses.USER_ID_REQUIRED_CHECK);
        }

        let solutionData = await solutionsQueries.solutionsDocument(
          {
            link: link,
            isReusable: false,
            status: {
              $ne: CONSTANTS.common.INACTIVE,
            },
          },
          ["type", "status", "endDate"]
        );

        if (!Array.isArray(solutionData) || solutionData.length < 1) {
          return resolve({
            message: CONSTANTS.apiResponses.INVALID_LINK,
            result: [],
          });
        }

        if (solutionData[0].status !== CONSTANTS.common.ACTIVE_STATUS) {
          return resolve({
            message: CONSTANTS.apiResponses.LINK_IS_EXPIRED,
            result: [],
          });
        }

        if (
          solutionData[0].endDate &&
          new Date() > new Date(solutionData[0].endDate)
        ) {
          if (solutionData[0].status === CONSTANTS.common.ACTIVE_STATUS) {
            let updateSolution = await this.update(
              solutionData[0]._id,
              {
                status: CONSTANTS.common.INACTIVE,
              },
              userId
            );
          }

          return resolve({
            message: CONSTANTS.apiResponses.LINK_IS_EXPIRED,
            result: [],
          });
        }

        response.verified = true;
        return resolve({
          message: CONSTANTS.apiResponses.LINK_VERIFIED,
          result: response,
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
   * Add entities in solution.
   * @method
   * @name addEntitiesInScope
   * @param {String} solutionId - solution Id.
   * @param {Array} entities - entities data.
   * @returns {JSON} - Added entities data.
   */

    static addEntitiesInScope(solutionId, entities) {
      return new Promise(async (resolve, reject) => {
        try {
          let solutionData = await solutionsQueries.solutionsDocument(
            {
              _id: solutionId,
              scope: { $exists: true },
              isReusable: false,
              isDeleted: false,
            },
            ["_id", "programId", "scope.entityType"]
          );
  
          if (!solutionData.length > 0) {
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
            });
          }
          let programData = await programQueries.programsDocument(
            {
              _id: solutionData[0].programId,
            },
            ["scope.entities", "scope.entityType"]
          );
  
          if (!programData.length > 0) {
            return resolve({
              status: HTTP_STATUS_CODE.bad_request.status,
              message: CONSTANTS.apiResponses.PROGRAM_NOT_FOUND,
            });
          }
  
          if (
            solutionData[0].scope.entityType !== programData[0].scope.entityType
          ) {
            let matchData = [];
            let checkEntityInParent = [];
            let childEntities = await userService.getSubEntitiesBasedOnEntityType(
              programData[0].scope.entities,
              solutionData[0].scope.entityType,
              matchData
            );
  
            if (!childEntities.length > 0) {
              throw {
                message: CONSTANTS.apiResponses.ENTITY_NOT_EXISTS_IN_PARENT,
              };
            }
            checkEntityInParent = entities.filter((element) =>
              childEntities.includes(element)
            );
            if (!checkEntityInParent.length > 0) {
              throw {
                message: CONSTANTS.apiResponses.ENTITY_NOT_EXISTS_IN_PARENT,
              };
            }
          }
          let entityIds = [];
          let bodyData = {};
          let locationData = UTILS.filterLocationIdandCode(entities);
  
          if (locationData.ids.length > 0) {
            bodyData = {
              id: locationData.ids,
              type: solutionData[0].scope.entityType,
            };
            let entityData = await userService.locationSearch(bodyData);
            if (entityData.success) {
              entityData.data.forEach((entity) => {
                entityIds.push(entity.id);
              });
            }
          }
  
          if (locationData.codes.length > 0) {
            let filterData = {
              code: locationData.codes,
              type: solutionData[0].scope.entityType,
            };
            let entityDetails = await userService.locationSearch(filterData);
  
            if (entityDetails.success) {
              entityDetails.data.forEach((entity) => {
                entityIds.push(entity.id);
              });
            }
          }
  
          if (!entityIds.length > 0) {
            throw {
              message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
            };
          }
  
          let updateSolution = await database.models.solutions
            .findOneAndUpdate(
              {
                _id: solutionId,
              },
              {
                $addToSet: { "scope.entities": { $each: entityIds } },
              },
              { new: true }
            )
            .lean();
  
          if (!updateSolution || !updateSolution._id) {
            throw {
              message: CONSTANTS.apiResponses.SOLUTION_NOT_UPDATED,
            };
          }
  
          return resolve({
            message: CONSTANTS.apiResponses.ENTITIES_ADDED_IN_SOLUTION,
            success: true,
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
   * remove entities in solution scope.
   * @method
   * @name removeEntitiesInScope
   * @param {String} solutionId - Program Id.
   * @param {Array} entities - entities.
   * @returns {JSON} - Removed entities from solution scope.
   */

  static removeEntitiesInScope(solutionId, entities) {
    return new Promise(async (resolve, reject) => {
      try {
        let solutionData = await solutionsQueries.solutionsDocument(
          {
            _id: solutionId,
            scope: { $exists: true },
            isReusable: false,
            isDeleted: false,
          },
          ["_id", "scope.entities"]
        );

        if (!solutionData.length > 0) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.SOLUTION_NOT_FOUND,
          });
        }
        let entitiesData = [];
        entitiesData = solutionData[0].scope.entities;
        if (!entitiesData.length > 0) {
          throw {
            message: CONSTANTS.apiResponses.ENTITIES_NOT_FOUND,
          };
        }

        let updateSolution = await database.models.solutions
          .findOneAndUpdate(
            {
              _id: solutionId,
            },
            {
              $pull: { "scope.entities": { $in: entities } },
            },
            { new: true }
          )
          .lean();

        if (!updateSolution || !updateSolution._id) {
          throw {
            message: CONSTANTS.apiResponses.SOLUTION_NOT_UPDATED,
          };
        }

        return resolve({
          message: CONSTANTS.apiResponses.ENTITIES_REMOVED_IN_SOLUTION,
          success: true,
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
