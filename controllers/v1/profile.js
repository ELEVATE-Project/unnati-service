const axios = require('axios')
let profileHelper = require(MODULES_BASE_PATH + '/profile/helper')

module.exports = class profile {
	static get name() {
		return 'profile'
	}

	async read(req) {
		return new Promise(async (resolve, reject) => {
			try {
				// Define headers for the user service request
				let headers = {
					internal_access_token: 'internal_access_token',
					'Content-Type': 'application/json',
				}
				// Fetch user details from user service
				const userResponse = await axios.get(
					CONSTANTS.endpoints.USER_SERVICE_URL + req.userDetails.userInformation.userId,
					{ headers }
				)
				// Check if user details were fetched successfully
				if (userResponse.status !== 200) {
					return res.status(userResponse.status).json({ error: CONSTANTS.common.STATUS_FAILURE })
				}
				// Extract user details from the response
				const userDetails = userResponse.data.result
				// Process meta data to extract location IDs
				const locationIds = await profileHelper.extractLocationIds(userDetails.meta)
				// Define headers for the entity management service request
				const HEADERS = {
					'x-authenticated-token': req.userDetails.userToken,
					'content-type': 'application/json',
					'internal-access-token': 'internal_access_token',
				}
				// Fetch details of entities based on location IDs
				const entityDetails = await profileHelper.fetchEntityDetails(locationIds, HEADERS)

				// Replace meta information in user details with actual entity details
				const processedResponse = await profileHelper.replaceMetaWithEntities(userDetails, entityDetails)
				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					result: processedResponse,
				})
			} catch (error) {
				return {
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				}
			}
		})
	}
}
