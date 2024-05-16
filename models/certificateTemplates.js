/**
 * name : certificateTemplates.js.
 * author : Prajwal.
 * created-date : 16-May-2024.
 * Description : Schema for Certificate Templates.
 */

module.exports = {
	name: 'certificateTemplates',
	schema: {
		templateUrl: String,
		issuer: {
			type: Object,
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: 'ACTIVE',
		},
		solutionId: {
			type: 'ObjectId',
			index: true,
			unique: true,
		},
		programId: {
			type: 'ObjectId',
			index: true,
			required: true,
		},
		criteria: {
			type: Object,
			required: true,
		},
	},
}
