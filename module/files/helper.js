/**
 * name : files/helper.js
 * author : prajwal
 * created-date : 25-Apr-2024
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
const Zip = require('adm-zip')
const fs = require('fs')
const { cloudClient } = require(PROJECT_ROOT_DIRECTORY + '/config/cloud-service')
let cloudStorage = process.env.CLOUD_STORAGE_PROVIDER

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {
	/**
	 * Get downloadable url
	 * @method
	 * @name                        - getDownloadableUrl
	 * @param {filePath}            - File path.
	 * @param {String}              - Bucket name
	 * @param {Array} storageName   - Storage name if provided.
	 * @param {Number} expireIn     - Link expire time.
	 * @return {String}             - Downloadable url link
	 */

	static getDownloadableUrl(filePath, bucketName, storageName = '', expireIn = '') {
		return new Promise(async (resolve, reject) => {
			try {
				// Override cloud storage provider name if provided explicitly.
				if (storageName !== '') {
					cloudStorage = storageName
				}
				// Override expireIn if env variable is present.
				if (expireIn !== '') {
					expireIn = process.env.DOWNLOADABLE_URL_EXPIRY_IN_SECONDS
				}

				if (Array.isArray(filePath) && filePath.length > 0) {
					let result = []

					// This loop helps in getting the downloadable url for all the uploaded files
					await Promise.all(
						filePath.map(async (element) => {
							let response = {}
							response.filePath = element
							// Get the downloadable URL from the cloud client SDK.
							// {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/sample-name/reports/uploadFile2.jpg?st=2023-08-05T07%3A11%3A25Z&se=2024-02-03T14%3A11%3A25Z&sp=r&sv=2018-03-28&sr=b&sig=k66FWCIJ9NjoZfShccLmml3vOq9Lt%2FDirSrSN55UclU%3D
							response.url = await cloudClient.getDownloadableUrl(
								bucketName,
								element,
								expireIn // Link ExpireIn
							)
							result.push(response)
						})
					)
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.URL_GENERATED,
						result: result,
					})
				} else {
					let result
					// Get the downloadable URL from the cloud client SDK.
					result = await cloudClient.getDownloadableUrl(
						bucketName, // bucket name
						filePath, // resource file path
						expireIn // Link Expire time
					)

					let response = {
						filePath: filePath,
						url: result,
						cloudStorage: cloudStorage,
					}
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.URL_GENERATED,
						result: response,
					})
				}
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Get all signed urls.
	 * @method
	 * @name preSignedUrls
	 * @param {Array} [fileNames]                         - fileNames.
	 * @param {String} bucket                             - name of the bucket
	 * @param {Array} [storageName]                       - Storage name if provided.
	 * @param {String} folderPath                         - folderPath
	 * @param {Number} expireIn                           - Link expire time.
	 * @param {String} permission                         - Action permission
	 * @param {Boolean} addDruidFileUrlForIngestion       - Add druid injection data to response {true/false}
	 * @param {Boolean} serviceUpload                     - serive Upload  {true/false}
	 * @returns {Array}                                   - consists of all signed urls files.
	 */

	static preSignedUrls(
		fileNames,
		bucket,
		storageName = '',
		folderPath,
		expireIn = '',
		permission = '',
		isFilePathPassed = false
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let actionPermission = CONSTANTS.common.WRITE_PERMISSION
				if (!Array.isArray(fileNames) || fileNames.length < 1) {
					throw new Error('File names not given.')
				}

				// Override cloud storage provider name if provided explicitly.
				if (storageName !== '') {
					cloudStorage = storageName
				}

				// Override actionPermission if provided explicitly.
				if (permission !== '') {
					actionPermission = permission
				}
				// Override expireIn if env variable is present.
				if (expireIn !== '') {
					expireIn = process.env.PRESIGNED_URL_EXPIRY_IN_SECONDS
				}

				// Create an array of promises for signed URLs
				// {sample response} : https://sunbirdstagingpublic.blob.core.windows.net/samiksha/reports/sample.pdf?sv=2020-10-02&st=2023-08-03T07%3A53%3A53Z&se=2023-08-03T08%3A53%3A53Z&sr=b&sp=w&sig=eZOHrBBH%2F55E93Sxq%2BHSrniCEmKrKc7LYnfNwz6BvWE%3D
				const signedUrlsPromises = fileNames.map(async (fileName) => {
					let file
					let response
					if (isFilePathPassed) {
						file = fileName
						response = {
							payload: { sourcePath: file },
						}
					} else {
						file = folderPath && folderPath !== '' ? folderPath + fileName : fileName
						response = {
							file: fileName,
							payload: { sourcePath: file },
						}
					}
					response.url = await cloudClient.getSignedUrl(
						bucket, // bucket name
						file, // file path
						expireIn, // expire
						actionPermission // read/write
					)

					return response
				})

				// Wait for all signed URLs promises to resolve
				const signedUrls = await Promise.all(signedUrlsPromises)

				// Return success response with the signed URLs
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.URL_GENERATED,
					result: signedUrls,
				})
			} catch (error) {
				return reject({
					success: false,
					message: CONSTANTS.apiResponses.FAILED_PRE_SIGNED_URL,
					error: error,
				})
			}
		})
	}

	/**
	 * Unzip file
	 * @method
	 * @name unzip
	 * @param  {String} zipFilePath - Path of zip file.
	 * @param  {String} folderToUnZip - Path where file should be unziped.
	 * @param  {String} deleteExistingZipFile - delete the existing zip file.
	 * @return {Object} - Save unzipped file
	 */

	static unzip(zipFilePath, folderToUnZip, deleteExistingZipFile) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!fs.existsSync(`${PROJECT_ROOT_DIRECTORY}${process.env.ZIP_PATH}`)) {
					fs.mkdirSync(`${PROJECT_ROOT_DIRECTORY}${process.env.ZIP_PATH}`)
				}

				const zip = new Zip(zipFilePath)

				zip.extractAllTo(folderToUnZip, true)

				if (deleteExistingZipFile) {
					fs.unlinkSync(zipFilePath)
				}

				return resolve({
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
				})
			}
		})
	}

	/**
	 * zip a folder
	 * @method
	 * @name zip
	 * @param  {String} existingName - existing file name.
	 * @param  {String} newFileName - new file name to set
	 * @return {Object} - Save unzipped file
	 */

	static zip(existing, newFolder) {
		return new Promise(async (resolve, reject) => {
			try {
				const zip = new Zip()

				zip.addLocalFolder(existing)
				zip.writeZip(newFolder)

				return resolve({
					success: true,
				})
			} catch (error) {
				return resolve({
					success: false,
				})
			}
		})
	}

	/**
	 * Rename file name
	 * @method
	 * @name rename
	 * @param  {String} existingName - existing file name.
	 * @param  {String} newFileName - new file name to set
	 * @return {Object} - Save unzipped file
	 */

	static rename(existingName, newFileName) {
		return new Promise(async (resolve, reject) => {
			try {
				fs.rename(existingName, newFileName, function (err) {
					if (err) {
						return resolve({
							success: false,
						})
					} else {
						return resolve({
							success: true,
						})
					}
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Save zip file in public zip folder
	 * @method
	 * @name saveZipFile
	 * @param  {String} zipFileName  - name of zip file.
	 * @param  {String}  zipFileData
	 * @return {Object} - Save zip file data.
	 */

	static saveZipFile(name, data) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!fs.existsSync(`${PROJECT_ROOT_DIRECTORY}${process.env.ZIP_PATH}`)) {
					fs.mkdirSync(`${PROJECT_ROOT_DIRECTORY}${process.env.ZIP_PATH}`)
				}

				let zipFileName = `${PROJECT_ROOT_DIRECTORY}${process.env.ZIP_PATH}/${name}`

				fs.writeFile(zipFileName, data, async function (err) {
					if (err) {
						return resolve({
							success: false,
						})
					} else {
						return resolve({
							success: true,
						})
					}
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Remove folder recursively
	 * @function
	 * @name removeFolder
	 * @param path - folder path.
	 * @returns {Promise}
	 */

	static removeFolder(path) {
		_removeFolder(path)
		return
	}
}

/**
 * Remove folder recursively
 * @function
 * @name _removeFolder
 * @param path - folder path.
 * @return
 */

function _removeFolder(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var currentPath = path + '/' + file
			if (fs.lstatSync(currentPath).isDirectory()) {
				// recurse
				_removeFolder(currentPath)
			} else {
				// delete file
				fs.unlinkSync(currentPath)
			}
		})
		fs.rmdirSync(path)
	}
}

/**
 * Remove file
 * @function
 * @name _removeFiles
 * @param filePath -  path of the file.
 * @return
 */

function _removeFiles(filePath) {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath)
	}
	return
}
