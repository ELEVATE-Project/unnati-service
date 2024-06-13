// calling entities service for entity-managament
const entityFind = require(GENERICS_FILES_PATH + '/services/entity-management')
// calling user service api
const profileRead = require(GENERICS_FILES_PATH + '/services/users')

module.exports = class FormsHelper {
	/**
	 * @function read
	 * @description Fetches and processes user profile data, including location details.
	 * @param {Object} userId - The userId ccontaining the userId.
	 * @returns {Promise<Object>} - A promise that resolves with the processed user profile data or an error object.
	 * @throws {Error} - Throws an error if the user details cannot be fetched or processed.
	 **/
	static read(userId) {
		return new Promise(async (resolve, reject) => {
			try {
				// Fetch user profile details using profileRead.profile function
				const userResponse = await profileRead.profile(userId)

				// Check if the user profile fetch was successful
				if (!userResponse.success) {
					throw new Error(CONSTANTS.common.STATUS_FAILURE)
				}
				// Store the fetched user details
				const userDetails = userResponse.data

				// Fetch location IDs associated with the user
				const locationIds = await this.userLocationDetails(userDetails.meta)
				if (locationIds.length < 0) {
					throw new Error(CONSTANTS.common.STATUS_FAILURE)
				}
				// Construct the filter for querying entity documents using the $in operator
				const filterData = {
					_id: {
						$in: locationIds,
					},
				}
				// Define the fields to be projected in the entity documents
				const projection = ['_id', 'metaInformation.name']
				// Use the entityDocuments function to fetch entity details
				const response = await entityFind.entityDocuments(filterData, projection, userId.userToken)
				// Check if the response is successful and has data
				const entityDetails = response.data
				if (entityDetails.length < 0) {
					throw new Error(CONSTANTS.common.STATUS_FAILURE)
				}

				// Process the user details to replace meta data with entity details
				const processedResponse = await this.processUserDetailsResponse(userDetails, entityDetails)

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
	static async userLocationDetails(meta) {
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
	static async processUserDetailsResponse(userDetails, entityDetails) {
		// Get all keys from the meta object in userDetails
		const metaKeys = Object.keys(userDetails.meta)
		// Loop through each key in the meta object
		for (const key of metaKeys) {
			// Get the IDs associated with the current meta key
			const ids = userDetails.meta[key]
			// Check if the meta value is an array of IDs
			if (Array.isArray(ids)) {
				// Replace each ID in the array with the corresponding entity details
				userDetails[key] = ids.map((id) => {
					// Find the entity that matches the current ID
					const entity = entityDetails.find((entity) => entity._id === id)
					// Return the formatted entity details or a placeholder if not found
					return entity
						? { value: entity._id, label: entity.metaInformation.name }
						: { value: id, label: 'Unknown' }
				})
			} else if (typeof ids === 'string') {
				// If the meta value is a string, replace it with entity details
				const entity = entityDetails.find((entity) => entity._id === ids)
				// Update the userDetails with the formatted entity details or a placeholder if not found
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
