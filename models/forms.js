/**
 * name : forms.js.
 * author : Prajwal.
 * created-date : 08-May-2024.
 * Description : Schema for Forms.
 */

const { Schema } = require('mongoose')

module.exports = {
	name: 'forms',
	schema: {
		type: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		subType: {
			type: String,
			required: true,
		},
		version: {
			type: Number,
			default: 0,
		},
		data: {
			type: Schema.Types.Mixed,
		},
		organizationId: {
			type: Number,
			required: true,
		},
	},
}
