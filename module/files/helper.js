/**
 * name : files.js
 * author : Vishnu
 * created-date : 01-Sep-2023
 * Description :  Files helper.
*/

const cloudServices = require(GENERICS_FILES_PATH + "/services/cloudStorage")

module.exports = class FilesHelper {

	/**
   * Get all signed urls.
   * @method
   * @name 								- preSignedUrls
   * @param {Array} payloadData 		- payload for files data.
   * @param {String} userId 			- Logged in user id.
   * @param {String} templateId			- certificateTemplateId.
   * @returns {Array} 					- consists of all signed urls files.
   */

	static preSignedUrls(payloadData, userId) {
		return new Promise(async (resolve, reject) => {
		  	try {			
				// Create an array of promises to generate signed URLs for each file in payloadData
				const signedUrlsPromises = payloadData.map(async (fileName) => {
					const uniqueId = UTILS.generateUniqueId();
					// Define the file path based on user ID and unique identifier
					const file = "project/" + userId + "/" + uniqueId + "/" + fileName;
					
					let signedUrlResponse = await _getSignedUrlFromCloudService(
						file	// file path
					);
					
					// Get the signed URL for the file from the cloud service
					let response = {
						file: fileName,
						url: signedUrlResponse
					};
					return response;
				});
		  
				// Wait for all signed URLs promises to resolve
				const signedUrls = await Promise.all(signedUrlsPromises);
				
				// Return success response with the signed URLs
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PRESSIGNED_URLS_GENERATED,
					data: signedUrls
				});

		  	} catch (error) {
				return resolve({
					status : HTTP_STATUS_CODE['internal_server_error'].status,
					message : CONSTANTS.apiResponses.FAILED_TO_GENERATE_PRESSIGNED_URLS,
					data : {}
				});
		  	}
		})
	}

	/**
	 * Get downloadable url
	 * @method
	 * @name                        - getDownloadableUrl
	 * @param {filePath}            - File path.
	 * @return {String}             - Downloadable url link
	*/

	static getDownloadableUrl(filePath) {
		return new Promise(async (resolve, reject) => {
		  	try {
				let result = []
	
				await Promise.all(
					filePath.map(async element => {
					let responseObj = {};
					responseObj.filePath = element
					// Get the downloadable URL from the cloud client SDK.
					// {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/sample-name/reports/uploadFile2.jpg?st=2023-08-05T07%3A11%3A25Z&se=2024-02-03T14%3A11%3A25Z&sp=r&sv=2018-03-28&sr=b&sig=k66FWCIJ9NjoZfShccLmml3vOq9Lt%2FDirSrSN55UclU%3D
					responseObj.url = await cloudServices.getDownloadableUrl(
						element		// filepath
					)
					result.push(responseObj)
					})
				)
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.DOWNLOADABLE_URL_GENERATED,
					result: result
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

/**
 * Get presigned url
 * @method
 * @name 					- _getSignedUrlFromCloudService
 * @param  {filePath}  		- File path.
 * @return {String} 		- Downloadable url link
*/

function _getSignedUrlFromCloudService(destFilePath) {
	return new Promise(async function (resolve, reject) {
	  try {
		let response
		if (process.env.CLOUD_STORAGE === 'GC') {
			response = await cloudServices.getGcpSignedUrl(destFilePath)
		} else if (process.env.CLOUD_STORAGE === 'AWS') {
			response = await cloudServices.getAwsSignedUrl(destFilePath)
		} else if (process.env.CLOUD_STORAGE === 'AZURE') {
			response = await cloudServices.getAzureSignedUrl(destFilePath)
		} else if (process.env.CLOUD_STORAGE === 'OCI') {
			response = await cloudServices.getOciSignedUrl(destFilePath)
		}
		return resolve(response)
	  } catch (error) {
		return reject(error)
	  }
	})
}
