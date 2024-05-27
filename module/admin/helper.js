/**
 * name : helper.js
 * author : Prajwal
 * created-date : 15-Apr-2024
 * Description : Admin.
 */

// Dependencies
const adminQueries = require(DB_QUERY_BASE_PATH + '/admin')

module.exports = class Admin {
	/**
	 * create index in the model.
	 * @method
	 * @name createIndex
	 * @param {String} collection - collectionName.
	 * @param {Array} keys - keys data.
	 * @returns {JSON} - success/failure message.
	 */
	static createIndex(collection, keys) {
		return new Promise(async (resolve, reject) => {
			try {
				let presentIndex = await adminQueries.listIndices(collection)
				let indexes = presentIndex.map((indexedKeys) => {
					return Object.keys(indexedKeys.key)[0]
				})
				let indexNotPresent = _.differenceWith(keys, indexes)
				if (indexNotPresent.length > 0) {
					indexNotPresent.forEach(async (key) => {
						await adminQueries.createIndex(collection, key)
					})
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_INDEXED_SUCCESSFULL,
						success: true,
					})
				} else {
					return resolve({
						message: CONSTANTS.apiResponses.KEYS_ALREADY_INDEXED_SUCCESSFULL,
						success: true,
					})
				}
			} catch (error) {
				return resolve({
					status: error.status ? error.status : HTTP_STATUS_CODE.internal_server_error.status,
					success: false,
					message: error.message,
					data: {},
				})
			}
		})
	}

	/**
	 * List of data based on collection
	 * @method
	 * @name dbFind
	 * @param {Object} reqBody - request body
	 * @returns {Object}  - collection details.
	 */

	static dbFind(collection, reqBody) {
		return new Promise(async (resolve, reject) => {
			try {
				if (reqBody.mongoIdKeys) {
					reqBody.query = await this.convertStringToObjectIdInQuery(reqBody.query, reqBody.mongoIdKeys)
				}

				let mongoDBDocuments = await this.list(
					collection,
					reqBody.query,
					reqBody.projection ? reqBody.projection : [],
					'none',
					reqBody.limit ? reqBody.limit : 100,
					reqBody.skip ? reqBody.skip : 0
				)

				return resolve({
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					success: true,
					result: mongoDBDocuments.data ? mongoDBDocuments.data : [],
					count: mongoDBDocuments.count ? mongoDBDocuments.count : 0,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}

	/**
	 * Convert String to ObjectIds inside Query.
	 * @method
	 * @name convertStringToObjectIdInQuery
	 * @returns {Array} Query.
	 */

	static convertStringToObjectIdInQuery(query, mongoIdKeys) {
		for (let pointerToArray = 0; pointerToArray < mongoIdKeys.length; pointerToArray++) {
			let eachKey = mongoIdKeys[pointerToArray]
			let currentQuery = query[eachKey]

			if (typeof currentQuery === 'string') {
				query[eachKey] = UTILS.convertStringToObjectId(currentQuery)
			} else if (typeof currentQuery === 'object') {
				let nestedKey = Object.keys(query[eachKey])
				if (nestedKey) {
					nestedKey = nestedKey[0]
					query[eachKey][nestedKey] = UTILS.arrayIdsTobjectIds(currentQuery[nestedKey])
				}
			}
		}

		return query
	}

	/**
	 * List of data based on collection.
	 * @method
	 * @name list
	 * @param {Object} filterQueryObject - filter query data.
	 * @param {Object} [projection = {}] - projected data.
	 * @returns {Promise} returns a promise.
	 */

	static list(
		collection,
		query = 'all',
		fields = 'all',
		skipFields = 'none',
		limitingValue = 100,
		skippingValue = 0,
		sortedData = ''
	) {
		return new Promise(async (resolve, reject) => {
			try {
				let queryObject = {}

				if (query != 'all') {
					queryObject = query
				}

				let projectionObject = {}

				if (fields != 'all') {
					fields.forEach((element) => {
						projectionObject[element] = 1
					})
				}

				if (skipFields != 'none') {
					skipFields.forEach((element) => {
						projectionObject[element] = 0
					})
				}

				let mongoDBDocuments

				if (sortedData !== '') {
					mongoDBDocuments = await database
						.getCollection(collection)
						.find(queryObject)
						.project(projectionObject)
						.sort(sortedData)
						.limit(limitingValue)
						.toArray()
				} else {
					mongoDBDocuments = await database
						.getCollection(collection)
						.find(queryObject)
						.project(projectionObject)
						.skip(skippingValue)
						.limit(limitingValue)
						.toArray()
				}
				// finding document count from db. We can't get it from result array length because a limiting value is passed
				let docCount = await database.getCollection(collection).find(queryObject).count()

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.DATA_FETCHED_SUCCESSFULLY,
					data: mongoDBDocuments,
					count: docCount,
				})
			} catch (error) {
				return resolve({
					success: false,
					message: error.message,
					data: false,
				})
			}
		})
	}
}
