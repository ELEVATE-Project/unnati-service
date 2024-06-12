const axios = require('axios')

module.exports = class FormsHelper {
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
	 * Fetches entity details for the given location IDs.
	 * @param {Array} locationIds - Array of location IDs.
	 * @param {Object} HEADERS - Headers for the HTTP request.
	 * @returns {Array} - An array of entity details.
	 */
	static async fetchEntityDetails(locationIds, HEADERS) {
		const entityDetails = []
		for (const id of locationIds) {
			try {
				// Make a POST request to fetch entity details
				const response = await axios.post(
					CONSTANTS.endpoints.ENTITY_MANAGEMENT_SERVICE_URL,
					{
						query: { _id: id },
						projection: ['_id', 'metaInformation.name'],
					},
					{ headers: HEADERS }
				)
				// Check if the response is successful and has data
				if (response.status === 200 && response.data.result.length > 0) {
					entityDetails.push(response.data.result[0])
				}
			} catch (error) {
				console.error(`Failed to fetch entity details for ID ${id}:`, error)
			}
		}
		return entityDetails
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
