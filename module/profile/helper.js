const axios = require('axios')
const entityFind = require('../../generics/services/entity-management')
const userServiceUrl = process.env.USER_SERVICE_URL

module.exports = class FormsHelper {
	/**
	 * @function read
	 * @description Fetches and processes user profile data, including location details.
	 * @param {Object} userId - The user details object containing the user's information.
	 * @returns {Promise<Object>} - A promise that resolves with the processed user profile data or an error object.
	 * @throws {Error} - Throws an error if the user details cannot be fetched or processed.
	 **/
	static read(userId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Define headers for the user service request
				let headers = {
					internal_access_token: 'internal_access_token',
					'Content-Type': 'application/json',
				}
				// Fetch user details from user service
				const userResponse = await axios.get(
					userServiceUrl + CONSTANTS.endpoints.USER_SERVICE_URL + userId.userInformation.userId,
					{ headers }
				)
				// Check if user details were fetched successfully
				if (userResponse.status !== 200) {
					throw new Error(CONSTANTS.common.STATUS_FAILURE)
				}
				const userDetails = userResponse.data.result

				const locationIds = await this.extractLocationIds(userDetails.meta)
				// Fetch details of entities based on location IDs
				const entityDetails = []
				for (const id of locationIds) {
					// Use the entityDocuments function to fetch entity details
					const filterData = { _id: id }
					const projection = ['_id', 'metaInformation.name']

					// Use the entityDocuments function to fetch entity details
					const response = await entityFind.entityDocuments(filterData, projection, userId.userToken)
					// Check if the response is successful and has data
					if (response.success && response.data.length > 0) {
						entityDetails.push(response.data[0])
					}
				}
				// Process the user details to replace meta data with entity details
				const processedResponse = await this.replaceMetaWithEntities(userDetails, entityDetails)
				return resolve(processedResponse)
			} catch (error) {
				return resolve({
					message: error,
					success: false,
				})
			}
		})
	}

	/**
	 * Extracts location IDs from the meta information.
	 * @param {Object} meta - Meta information containing location IDs.
	 * @returns {Array} - An array of location IDs.
	 */
	static async extractLocationIds(meta) {
		const locationIds = []
		for (const key in meta) {
			if (Array.isArray(meta[key])) {
				// If the meta value is an array, add all elements to locationIds
				locationIds.push(...meta[key])
			} else if (typeof meta[key] === 'string') {
				// If the meta value is a string, add it to locationIds
				locationIds.push(meta[key])
			}
		}
		return locationIds
	}

	/**
	 * Replaces meta information in user details with actual entity details.
	 * @param {Object} userDetails - User details containing meta information.
	 * @param {Array} entityDetails - Array of entity details.
	 * @returns {Object} - Updated user details with entity information.
	 */
	static async replaceMetaWithEntities(userDetails, entityDetails) {
		const metaKeys = Object.keys(userDetails.meta)
		for (const key of metaKeys) {
			const ids = userDetails.meta[key]
			if (Array.isArray(ids)) {
				// If the meta value is an array, replace each ID with entity details
				userDetails[key] = ids.map((id) => {
					const entity = entityDetails.find((entity) => entity._id === id)
					return entity
						? { value: entity._id, label: entity.metaInformation.name }
						: { value: id, label: 'Unknown' }
				})
			} else if (typeof ids === 'string') {
				// If the meta value is a string, replace it with entity details
				const entity = entityDetails.find((entity) => entity._id === ids)
				userDetails[key] = entity
					? { value: entity._id, label: entity.metaInformation.name }
					: { value: ids, label: 'Unknown' }
			}
		}
		// Clear meta information and remove location field
		userDetails.meta = {}
		delete userDetails.location
		return userDetails
	}
}
