/**
 * name : forms.js
 * author : Vishnu
 * created-date : 06-Sep-2024
 * Description :  Forms Controller.
 */

// dependencies
let formsHelpers = require(MODULES_BASE_PATH + '/forms/helper')

/**
 * Forms service.
 * @class
 */

module.exports = class Forms extends Abstract {
	constructor() {
		super('forms')
	}
	static get name() {
		return 'forms'
	}

	/**
	 * create mentoring form
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - forms creation object.
	 */

	async create(req) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log('User details : ', req.userDetails)
				let createdForm = await formsHelpers.create(req.body, req.userDetails.userInformation.organization_id)
				return resolve(createdForm)
			} catch (error) {
				reject({
					status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
					message: error.message || HTTP_STATUS_CODE.internal_server_error.message,
					errorObject: error,
				})
			}
		})
	}

	/**
	 * updates mentoring form
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - forms updation response.
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedForm = await formsService.update(req.params.id, params, req.decodedToken.organization_id)
			return updatedForm
		} catch (error) {
			return error
		}
	}

	/**
	 * reads mentoring form
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - form object.
	 */

	async read(req) {
		const params = req.body
		try {
			if (!req.params.id && Object.keys(req.body).length === 0) {
				const form = await formsService.readAllFormsVersion()
				return form
			} else {
				const form = await formsService.read(req.params.id, params, req.decodedToken.organization_id)
				return form
			}
		} catch (error) {
			return error
		}
	}
}
