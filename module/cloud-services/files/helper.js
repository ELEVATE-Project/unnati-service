/**
 * name : files/helper.js
 * author : prajwal
 * created-date : 25-Apr-2024
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies

let filesHelpers = require(MODULES_BASE_PATH + "/files/helper");
const cloudStorage = process.env.CLOUD_STORAGE_PROVIDER;
const bucketName = process.env.CLOUD_STORAGE_BUCKETNAME;
const bucktType = process.env.CLOUD_STORAGE_BUCKET_TYPE
const fs = require("fs");


/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {
  /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {Array} payloadData       - payload for files data.
   * @param {String} referenceType    - reference type
   * @param {String} userId           - Logged in user id.
   * @param {String} templateId       - certificateTemplateId.
   * @param {Boolean} serviceUpload     - serive Upload  {true/false}
   * @returns {Array}                 - consists of all signed urls files.
   */

  static preSignedUrls(payloadData, userId = "") {

    return new Promise(async (resolve, reject) => {
      try {
        let payloadIds = Object.keys(payloadData);

        let result = {
          [payloadIds[0]]: {},
        };

        for (let pointerToPayload = 0; pointerToPayload < payloadIds.length; pointerToPayload++) {
        let payloadId = payloadIds[pointerToPayload];
        let folderPath =
            "project/" +
            payloadId +
            "/" +
            userId +
            "/" +
            UTILS.generateUniqueId() +
            "/";
        let imagePayload = await filesHelpers.preSignedUrls(
            payloadData[payloadId].files,
            bucketName,
            cloudStorage,
            folderPath,
            '',   //expireIn PARAMS
            '',   //permission PARAMS
        );

        if (!imagePayload.success) {
            return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.FAILED_PRE_SIGNED_URL,
            result: {},
            });
        }

        if (!result[payloadId]) {
            result[payloadId] = {};
        }

        result[payloadId]["files"] = imagePayload.result;
        }
        

        return resolve({
          message: CONSTANTS.apiResponses.URL_GENERATED,
          data: result,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Get Downloadable URL from cloud.
   * @method
   * @name getDownloadableUrl
   * @param {Array} payloadData       - payload for files data.
   * @returns {JSON}                  - Response with status and message.
   */

  static getDownloadableUrl(payloadData) {
    return new Promise(async (resolve, reject) => {
      try {
        if(bucktType === CONSTANTS.common.PRIVATE){
            let downloadableUrl = await filesHelpers.preSignedUrls(
                payloadData,
                bucketName,
                cloudStorage,
                "",
                "",   //expireIn PARAMS
                CONSTANTS.common.READ_PERMISSION,   //permission PARAMS
                true        //true if filePath is passed
            );

            if (!downloadableUrl.success) {
                return resolve({
                    status: HTTP_STATUS_CODE.bad_request.status,
                    message: CONSTANTS.apiResponses.FAILED_TO_CREATE_DOWNLOADABLEURL,
                    result: {},
                  });
              }

            return resolve({
                message: CONSTANTS.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
                result: downloadableUrl.result,
            });
            
        }
        let downloadableUrl = await filesHelpers.getDownloadableUrl(
          payloadData,
          bucketName,
          cloudStorage,
          CONSTANTS.common.READ_PERMISSION
        );
        if (!downloadableUrl.success) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.FAILED_TO_CREATE_DOWNLOADABLEURL,
            result: {},
          });
        }

        return resolve({
          message: CONSTANTS.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
          result: downloadableUrl.result,
        });
      } catch (error) {
        return reject({
          status:
            error.status || HTTP_STATUS_CODE.internal_server_error.status,

          message:
            error.message || HTTP_STATUS_CODE.internal_server_error.message,

          errorObject: error,
        });
      }
    });
  }

  /**
   * upload file to the Cloud .
   * @method
   * @name upload
   * @param {Buffer} payloadData    - Binary value of file.
   * @param {String} folderPath         - folderPath.
   * @param {String} fileName           - fileName.
   * @returns {JSON}                    -  path and downloadUrl of the file.
   */

  static upload(localFilePath,folderPath) {
    return new Promise(async (resolve, reject) => {
      try {
        // Use fs.promises.readFile to read the file content asynchronously
        let binaryDataOfFile = await fs.promises.readFile(localFilePath);

        let uploadFile = await filesHelpers.upload(
          folderPath,
          bucketName,
          binaryDataOfFile
        );
       // Use fs.promises.unlink to remove the file asynchronously
        await fs.promises.unlink(localFilePath);
       
        if (!uploadFile.success) {
          return resolve({
            status: HTTP_STATUS_CODE.bad_request.status,
            message: CONSTANTS.apiResponses.FAILED_TO_UPLOAD,
            result: {},
          });
        }

        return resolve({
          status: HTTP_STATUS_CODE.ok.status,
          message: CONSTANTS.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
          result: uploadFile.result,
        });
      } catch (error) {
       
        return reject({
          status:
            error.status || HTTP_STATUS_CODE.internal_server_error.status,

          message:
            error.message || HTTP_STATUS_CODE.internal_server_error.message,

          errorObject: error,
        });
      }
    });
  }

 
  
}
