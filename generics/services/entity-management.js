/**
 * name : entity-management.js
 * author : prajwal
 * Date : 18-Apr-2024
 * Description : Entity service related information.
 */

//dependencies
const request = require('request')
const fs = require('fs')

const entityManagementServiceUrl = process.env.ENTITY_MANAGEMENT_SERVICE_URL

/**
 * List of entity data.
 * @function
 * @name entityDocuments
 * @param {Object} filterData - Filter data.
 * @param {Array} projection - Projected data.
 * @returns {JSON} - List of entity data.
 */

const entityDocuments = function (filterData = 'all', projection = 'all') {
	return new Promise(async (resolve, reject) => {
		try {
			const url = entityManagementServiceUrl + CONSTANTS.endpoints.FIND_ENTITY_DOCUMENTS
			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
				},
				json: {
					query: filterData,
					projection: projection,
				},
			}

			request.post(url, options, requestCallBack)

			function requestCallBack(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE.ok.status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

/**
 * List of entity data.
 * @function
 * @name entityDocuments
 * @param {Object} filterData - Filter data.
 * @param {Array} projection - Projected data.
 * @returns {JSON} - List of entity data.
 */

const entityTypeDocuments = function (filterData = 'all', projection = 'all', userToken) {
	return new Promise(async (resolve, reject) => {
		try {
			const url = entityManagementServiceUrl + CONSTANTS.endpoints.FIND_ENTITY_TYPE_DOCUMENTS
			const options = {
				headers: {
					'content-type': 'application/json',
					'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
					'x-authenticated-token': userToken,
				},
				json: {
					query: filterData,
					projection: projection,
				},
			}

			request.post(url, options, requestCallBack)

			function requestCallBack(err, data) {
				let result = {
					success: true,
				}

				if (err) {
					result.success = false
				} else {
					let response = data.body
					if (response.status === HTTP_STATUS_CODE.ok.status) {
						result['data'] = response.result
					} else {
						result.success = false
					}
				}

				return resolve(result)
			}
		} catch (error) {
			return reject(error)
		}
	})
}

module.exports = {
	entityDocuments: entityDocuments,
	entityTypeDocuments: entityTypeDocuments,
}
