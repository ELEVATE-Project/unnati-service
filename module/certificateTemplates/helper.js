/**
 * name : helper.js
 * author : Vishnu
 * created-date : 29-sep-2022
 * Description : Certificate Template related helper functionality.
 */
// dependencies
const request = require('request')
const axios = require('axios')
let fs = require('fs')
const cheerio = require('cheerio')
const filesHelpers = require(MODULES_BASE_PATH + '/cloud-services/files/helper')
const certificateTemplateQueries = require(DB_QUERY_BASE_PATH + '/certificateTemplates')
const certificateBaseTemplateQueries = require(DB_QUERY_BASE_PATH + '/certificateBaseTemplates')

/**
 * CertificateTemplatesHelper
 * @class
 */
module.exports = class CertificateTemplatesHelper {
	/**
	 * Create certificate template.
	 * @method create
	 * @name create
	 * @param {Object} data - certificate template creation data.
	 * @returns {JSON} created certificate template details.
	 */

	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let certificateTemplateCreated = await certificateTemplateQueries.createCertificateTemplate(data)
				return resolve({
					message: CONSTANTS.apiResponses.CERTIFICATE_TEMPLATE_ADDED,
					data: {
						_id: certificateTemplateCreated._id,
					},
					result: {
						_id: certificateTemplateCreated._id,
					},
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * Update certificate template.
	 * @method update
	 * @name update
	 * @param {String} templateId - certificate template Id.
	 * @param {Object} data - certificate template updation data.
	 * @returns {JSON} Updated certificate template details.
	 */

	static update(templateId, data) {
		return new Promise(async (resolve, reject) => {
			try {
				// in case support team pass below values as empty string (not valid) we cant check it with validator. So adding it here
				//  If templateUrl value passed as empty string.
				if (!data.templateUrl) {
					delete data.templateUrl
				}
				//  If solutionId value passed as empty string.
				if (!data.solutionId) {
					delete data.solutionId
				}
				//  If programId value passed as empty string.
				if (!data.programId) {
					delete data.programId
				}
				let updateObject = {
					$set: data,
				}
				let certificateTemplateUpdated = await certificateTemplateQueries.updateCertificateTemplate(
					{ _id: templateId },
					updateObject
				)
				if (certificateTemplateUpdated == null) {
					throw {
						message: CONSTANTS.apiResponses.CERTIFICATE_TEMPLATE_NOT_UPDATED,
					}
				}
				return resolve({
					message: CONSTANTS.apiResponses.CERTIFICATE_TEMPLATE_UPDATED,
					data: {
						_id: certificateTemplateUpdated._id,
					},
					result: {
						_id: certificateTemplateUpdated._id,
					},
				})
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * upload certificate template.
	 * @method
	 * @name uploadToCloud
	 * @param {Object} fileData - file to upload.
	 * @param {String} templateId - templateId.
	 * @param {String} userId - user Id.
	 * @returns {JSON} Uploaded certificate template details.
	 */

	static uploadToCloud(fileData, templateId, userId = '', updateTemplate = false) {
		return new Promise(async (resolve, reject) => {
			try {
				if (updateTemplate == 'true' || updateTemplate == true) {
					updateTemplate = true
				} else {
					updateTemplate == false
				}
				let fileName
				const now = new Date()
				const date = now.getDate() + '-' + now.getMonth() + '-' + now.getFullYear() + '-' + now.getTime()
				if (updateTemplate == false) {
					fileName = `${date}_${fileData.file.name}`
				} else {
					fileName = `${templateId}/${date}_${fileData.file.name}`
				}

				let uniqueId = await UTILS.generateUniqueId()

				let requestData = {
					[uniqueId]: {
						files: [fileName],
					},
				}

				let referenceType
				if (updateTemplate == false) {
					referenceType = 'baseTemplates'
				} else {
					referenceType = CONSTANTS.common.CERTIFICATE
				}

				let signedUrl = await filesHelpers.preSignedUrls(
					requestData, // data to upload
					userId,
					true, // isCertificateFilewill be set true for certificate generation
					referenceType // referenceType
				)

				//  upload file using signed Url
				if (
					signedUrl.data &&
					Object.keys(signedUrl.data).length > 0 &&
					signedUrl.data[uniqueId].files.length > 0 &&
					signedUrl.data[uniqueId].files[0].url &&
					signedUrl.data[uniqueId].files[0].url !== ''
				) {
					let fileUploadUrl = signedUrl.data[uniqueId].files[0].url
					let file = fileData.file.data

					try {
						const uploadData = await axios.put(fileUploadUrl, file, {
							headers: {
								'x-ms-blob-type': process.env.CLOUD_STORAGE_PROVIDER === 'azure' ? 'BlockBlob' : null,
								'Content-Type': 'multipart/form-data',
							},
						})
						let updateCertificateTemplate = {}
						if (updateTemplate == true) {
							//  Update certificate template url in certificateTemplates collection
							updateCertificateTemplate = await this.update(templateId, {
								// certificateTemplates/6343bd978f9d8980b7841e85/ba9aa220-ff1b-4717-b6ea-ace55f04fc16_2022-9-10-1665383945769.svg
								templateUrl: signedUrl.data[uniqueId].files[0].payload.sourcePath,
							})
							return resolve({
								success: true,
								data: {
									templateId: updateCertificateTemplate.data._id,
									templateUrl: signedUrl.data[uniqueId].files[0].payload.sourcePath,
								},
							})
						}
						return resolve({
							success: true,
							data: {
								templateUrl: signedUrl.data[uniqueId].files[0].payload.sourcePath,
							},
						})
					} catch (error) {
						return reject(error)
					}
				} else {
					return resolve({
						success: false,
					})
				}
			} catch (error) {
				return reject(error)
			}
		})
	}

	/**
	 * create svg template by editing base template.
	 * @method
	 * @name createSvg
	 * @param {Object} files - file to replace.
	 * @param {Object} textData - texts to edit.
	 * @param {String} baseTemplateId - Base template Id.
	 * @returns {JSON} Uploaded certificate template details.
	 */
	static createSvg(files, textData, baseTemplateId) {
		return new Promise(async (resolve, reject) => {
			try {
				let baseTemplateData = await certificateBaseTemplateQueries
					.findDocument(
						{
							_id: baseTemplateId,
						},
						['url']
					)
					.lean()

				if (!(baseTemplateData.length > 0) || !baseTemplateData[0].url || baseTemplateData[0].url == '') {
					throw {
						message: CONSTANTS.apiResponses.BASE_CERTIFICATE_TEMPLATE_NOT_FOUND,
					}
				}
				let templateUrl = baseTemplateData[0].url
				// getDownloadable url of svg file that we are using as template
				let baseTemplateDownloadableUrl = await filesHelpers.getDownloadableUrl([templateUrl])
				let baseTemplate = await getBaseTemplate(baseTemplateDownloadableUrl.result[0].url)
				if (!baseTemplate.success) {
					throw {
						message: CONSTANTS.apiResponses.BASE_CERTIFICATE_TEMPLATE_NOT_FOUND,
					}
				}
				// load Base template svg elements
				const $ = cheerio.load(baseTemplate.result)
				let htmltags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>']
				let imageNames = ['stateLogo1', 'stateLogo2', 'signatureImg1', 'signatureImg2']
				let textKeys = [
					'stateTitle',
					'signatureTitleName1',
					'signatureTitleDesignation1',
					'signatureTitleName2',
					'signatureTitleDesignation2',
				]

				// edit image elements
				for (let imageNamesIndex = 0; imageNamesIndex < imageNames.length; imageNamesIndex++) {
					if (
						files[imageNames[imageNamesIndex]] &&
						files[imageNames[imageNamesIndex]]['data'] &&
						files[imageNames[imageNamesIndex]]['data'] != ''
					) {
						let data = files[imageNames[imageNamesIndex]]['data']
						let imageData = 'data:image/png;base64,' + data.toString('base64')
						const element = $('#' + imageNames[imageNamesIndex])
						element.attr('href', imageData)
					}
				}

				// edit text elements
				for (let textKeysIndex = 0; textKeysIndex < textKeys.length; textKeysIndex++) {
					if (textData[textKeys[textKeysIndex]]) {
						let updateText = textData[textKeys[textKeysIndex]]
						const element = $('#' + textKeys[textKeysIndex])
						element.text(updateText)
					}
				}
				let updatedSvg = $.html()

				// remove html tags- svg file does not require these tags
				for (let index = 0; index < htmltags.length; index++) {
					updatedSvg = updatedSvg.replace(htmltags[index], '')
				}

				// file data to upload to cloud
				let fileData = {
					file: {
						data: updatedSvg,
					},
				}
				// upload new svg created from base template to cloud
				const uploadTemplate = await this.uploadToCloud(fileData, 'BASE_TEMPLATE', '', false)
				if (!uploadTemplate.success) {
					throw {
						message: CONSTANTS.apiResponses.COULD_NOT_UPLOAD_CONTENT,
					}
				}

				// getDownloadable url of uploaded template
				let downloadableUrl = await filesHelpers.getDownloadableUrl([uploadTemplate.data.templateUrl])
				return resolve({
					message: 'Template edited successfully',
					result: {
						url: downloadableUrl.result[0].url,
					},
				})
			} catch (error) {
				return reject(error)
			}
		})
	}
}

// Function to fetch data information from cloud using downloadable Url
const getBaseTemplate = function (templateUrl) {
	return new Promise(async (resolve, reject) => {
		try {
			axios
				.get(templateUrl)
				.then((response) => {
					if (response.status === 200) {
						return {
							success: true,
							result: response.data,
						}
					} else {
						throw {
							success: false,
						}
					}
				})
				.catch((error) => {
					throw {
						success: false,
					}
				})
		} catch (error) {
			return reject(error)
		}
	})
}
