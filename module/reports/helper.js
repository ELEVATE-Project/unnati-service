/**
 * name : helper.js
 * author : Rakesh
 * created-date : 01-Nov-2020
 * Description : Entity report functionalities
 */

// Dependencies

const userProjectsHelper = require(MODULES_BASE_PATH + '/userProjects/helper')
const projectQueries = require(DB_QUERY_BASE_PATH + '/projects')
const { result } = require('lodash')
const moment = require('moment')
const common_handler_v2 = require(GENERICS_FILES_PATH + '/helpers/common_handler_v2')

/**
 * Report Helper
 * @class
 */

module.exports = class ReportsHelper {
	/**
	 * Entity Report.
	 * @method
	 * @name entity
	 * @param {String} entityId - mapped entity id.
	 * @param {String} userId - Logged in user id.
	 * @param {String} userToken - Logged in user keyclock token.
	 * @param {String} userId - Logged in user name.
	 * @param {String} reportType - report type monthly or quterly.
	 * @param {String} programId - program id
	 * @param {Boolean} getPdf - pdf true or false
	 * @returns {Object} Entity report.
	 */
	static entity(entityId = '', userId, userToken, userName, reportType, programId = '', getPdf, appVersion) {
		return new Promise(async (resolve, reject) => {
			try {
				let query = {}

				// If entityId is provided, use it; otherwise, use userId.
				if (entityId) {
					query['entityId'] = entityId
				} else {
					query['userId'] = userId
				}

				let dateRange = await _getDateRangeofReport(reportType)
				let endOf = dateRange.endOf
				let startFrom = dateRange.startFrom

				let pdfReportString = moment(startFrom).format('MMM YY')
				if (reportType == 3) {
					pdfReportString += ' - ' + moment(endOf).format('MMM YY')
				}

				if (programId) {
					query['programId'] = ObjectId(programId)
				}
				query['isDeleted'] = { $ne: true }

				query['$or'] = [
					{ syncedAt: { $gte: new Date(startFrom), $lte: new Date(endOf) } },
					{
						tasks: {
							$elemMatch: {
								isDeleted: { $ne: true },
							},
						},
					},
				]

				const projectDetails = await projectQueries.projectDocument(
					query,
					['taskReport', 'status', 'tasks', 'categories', 'endDate'],
					[]
				)

				let tasksReport = {
					total: 0,
					overdue: 0,
				}
				tasksReport[CONSTANTS.common.COMPLETED_STATUS] = 0
				tasksReport[CONSTANTS.common.INPROGRESS_STATUS] = 0
				tasksReport[CONSTANTS.common.NOT_STARTED_STATUS] = 0

				let categories = {
					total: 0,
				}

				let projectReport = {
					total: 0,
					overdue: 0,
				}
				projectReport[CONSTANTS.common.SUBMITTED_STATUS] = 0
				projectReport[CONSTANTS.common.INPROGRESS_STATUS] = 0
				projectReport[CONSTANTS.common.STARTED] = 0

				let types = await this.types()
				let returnTypeInfo = types.data.find((type) => type.value == reportType)

				if (!projectDetails.length > 0) {
					return resolve({
						message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
						data: {
							dataAvailable: false,
							data: {
								categories: categories,
								tasks: tasksReport,
								projects: projectReport,
							},
						},
					})
				}

				await Promise.all(
					projectDetails.map(async (project) => {
						if (project.categories) {
							project.categories.forEach((category) => {
								let key = category.externalId || category.name
								categories[key] = (categories[key] || 0) + 1
							})
							categories['total'] += project.categories.length
						}

						if (project.status == CONSTANTS.common.SUBMITTED_STATUS) {
							projectReport[CONSTANTS.common.SUBMITTED_STATUS]++
						} else if (
							project.status == CONSTANTS.common.INPROGRESS_STATUS ||
							project.status == CONSTANTS.common.STARTED
						) {
							let overdue = _getOverdueStatus(project.endDate)
							if (overdue) {
								projectReport['overdue']++
							} else {
								projectReport[project.status]++
							}
						}
						projectReport['total'] =
							projectReport[CONSTANTS.common.STARTED] +
							projectReport['overdue'] +
							projectReport[CONSTANTS.common.INPROGRESS_STATUS] +
							projectReport[CONSTANTS.common.SUBMITTED_STATUS]

						if (project.taskReport) {
							Object.keys(project.taskReport).forEach((key) => {
								tasksReport[key] = (tasksReport[key] || 0) + project.taskReport[key]
							})
						}

						await Promise.all(
							project.tasks.map((task) => {
								if (!task.isDeleted && task.status != CONSTANTS.common.COMPLETED_STATUS) {
									let overdue = _getOverdueStatus(task.endDate)
									if (overdue) {
										tasksReport['overdue'] = (tasksReport['overdue'] || 0) + 1
										tasksReport[task.status]--
									}
								}
							})
						)
					})
				)

				if (getPdf) {
					let reportTaskData = {}
					Object.keys(tasksReport).map((taskData) => {
						reportTaskData[UTILS.camelCaseToTitleCase(taskData)] = tasksReport[taskData]
					})

					let categoryData = {}
					Object.keys(categories).map((category) => {
						categoryData[UTILS.camelCaseToTitleCase(category)] = categories[category]
					})

					let types = await this.types()
					let returnTypeInfo = types.data.filter((type) => {
						if (type.value == reportType) {
							return type.label
						}
					})
					let pdfRequest = {
						reportType: returnTypeInfo.label,
						sharedBy: userName,
						reportTitle: pdfReportString,
						categories: categoryData,
						tasks: reportTaskData,
						projects: projectReport,
					}
					if (programId != '') {
						pdfRequest['programName'] = projectDetails[0].programInformation.name
					}
					if (entityId != '') {
						pdfRequest['entityName'] = projectDetails[0].entityInformation.name
					}

					let response = await common_handler_v2.unnatiEntityReportPdfGeneration(pdfRequest, userId)
					if (response && response.success) {
						return resolve({
							success: true,
							message: CONSTANTS.apiResponses.REPORT_GENERATED,
							data: {
								data: {
									downloadUrl: response.pdfUrl,
								},
							},
						})
					} else {
						return resolve({
							success: false,
							message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
							data: [],
						})
					}
				} else {
					let response = {
						categories: categories,
						tasks: tasksReport,
						projects: projectReport,
					}
					return resolve({
						success: true,
						message: CONSTANTS.apiResponses.REPORTS_GENERATED,
						data: {
							dataAvailable: true,
							data: response,
						},
					})
				}
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
	 * Get programs list.
	 * @method
	 * @name getProgramsByEntity
	 * @param {String} userId - Logged in user id.
	 * @param {String} entityId - entity id.
	 * @param {String} pageSize - Size of page.
	 * @param {String} pageNo - Recent page no.
	 * @param {String} search - search text.
	 * @param {String} userRole - User roles (optional) to be provided if entityId not given.
	 * @returns {Object} -  returns programs list
	 */

	static getProgramsByEntity(userId = '', entityId = '', pageSize, pageNo, search, userRole = '') {
		return new Promise(async (resolve, reject) => {
			try {
				let query = {
					userId: userId,
					programId: {
						$exists: true,
					},
				}

				if (entityId != '') {
					query.entityId = entityId
				}

				if (userRole != '') {
					let regex = userRole.split(',')
					regex.push('')
					query.userRole = {
						$regex: regex.join('|'),
						$options: 'i',
					}
				}

				let searchQuery = []
				if (search !== '') {
					searchQuery = [{ 'programInformation.name': new RegExp(search, 'i') }]
				}

				let groupBy = {
					_id: '$programId',
					programName: { $first: '$programInformation.name' },
					programId: { $first: '$programId' },
				}

				const projectDocuments = await userProjectsHelper.projects(
					query,
					pageSize,
					pageNo,
					searchQuery,
					['programInformation', 'programId', 'userId'],
					groupBy
				)

				if (projectDocuments.data && projectDocuments.data.count && projectDocuments.data.count == 0) {
					return resolve({
						message: CONSTANTS.apiResponses.PROGRAMS_NOT_FOUND,
						data: [],
					})
				}

				let programs = []
				let projectDetails = projectDocuments.data.data
				for (let index = 0; index < projectDetails.length; index++) {
					programs.push({
						name: projectDetails[index].programName,
						_id: projectDetails[index].programId.toString(),
					})
				}

				return resolve({
					success: true,
					message: CONSTANTS.apiResponses.PROGRAMS_FOUND,
					data: {
						data: programs,
						count: projectDocuments.data.count,
					},
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
	 * Get report types
	 * @method
	 * @name types
	 * @returns {Object} - returns report types
	 */
	static types() {
		return new Promise(async (resolve, reject) => {
			try {
				let reportTypes = [
					{
						label: 'Weekly',
						value: 0,
					},
					{
						label: 'Monthly',
						value: 1,
					},
					{
						label: 'Quarterly',
						value: 2,
					},
				]

				resolve({
					success: true,
					message: CONSTANTS.apiResponses.REPORT_TYPES_FOUND,
					data: reportTypes,
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
	 * Detail view Report.
	 * @method
	 * @name detailView
	 * @param {String} userId - Logged in user id.
	 * @param {String} userToken - Logged in user keyclock token.
	 * @param {String} reportType - report type monthly or quterly.
	 * @param {String} entityId - mapped entity id.
	 * @param {String} programId - program id
	 * @param {Boolean} getPdf - to get pdf
	 * @returns {Object} - response consist of chart report data
	 */

	static detailView(userId, userToken, reportType, entityId = '', programId, getPdf) {
		return new Promise(async (resolve, reject) => {
			try {
				let query = {
					isDeleted: { $ne: true },
				}

				if (entityId) {
					query['entityId'] = entityId
				} else {
					query['userId'] = userId
				}

				let chartObject = []
				let dateRange = await _getDateRangeofReport(reportType)
				let endOf = dateRange.endOf
				let startFrom = dateRange.startFrom

				query['$or'] = [
					{ syncedAt: { $gte: new Date(startFrom), $lte: new Date(endOf) } },
					{
						tasks: {
							$elemMatch: {
								isDeleted: { $ne: true },
								// syncedAt: { $gte: new Date(startFrom), $lte: new Date(endOf) },
							},
						},
					},
				]
				if (programId) {
					query['programId'] = ObjectId(programId)
				}

				const projectDetails = await projectQueries.projectDocument(
					query,
					[
						'title',
						'taskReport',
						'status',
						'tasks.status',
						'tasks.startDate',
						'tasks.endDate',
						'tasks.name',
						'categories',
						'startDate',
						'endDate',
					],
					[]
				)
				if (!projectDetails.length > 0) {
					return resolve({
						message: CONSTANTS.apiResponses.REPORTS_DATA_NOT_FOUND,
						data: [],
					})
				}

				if (getPdf == true) {
					let types = await this.types()
					let returnTypeInfo = types.data.filter((type) => {
						if (type.value == reportType) {
							return type.label
						}
					})

					let projectData = []
					await Promise.all(
						projectDetails.map((project) => {
							let projectInfo = {
								startDate: project.startDate,
								endDate: project.endDate,
								status: project.status,
								title: project.title,
								tasks: [],
							}

							project.tasks.map((task) => {
								projectInfo.tasks.push({
									startDate: task.startDate,
									endDate: task.endDate,
									status: task.status,
									title: task.name,
								})
							})
							projectData.push(projectInfo)
						})
					)
					let data = {
						reportType: returnTypeInfo[0].label,
						projectDetails: projectData,
					}

					let response = await common_handler_v2.unnatiViewFullReportPdfGeneration(data, userId)
					if (response && response.success) {
						return resolve({
							success: true,
							message: CONSTANTS.apiResponses.REPORT_GENERATED,
							data: {
								data: {
									downloadUrl: response.pdfUrl,
								},
							},
						})
					}
				} else {
					await Promise.all(
						projectDetails.map(async (projectList) => {
							let reponseObj = {
								title: {
									text: projectList.title,
								},
								series: [
									{
										name: projectList.title,
										data: [],
									},
								],
								xAxis: {},
							}
							reponseObj.series[0].data = []
							reponseObj.xAxis.min = ''
							reponseObj.xAxis.max = ''
							reponseObj.series[0].name = projectList.title
							if (projectList.tasks && projectList.tasks.length > 0) {
								await Promise.all(
									projectList.tasks.map(async (taskList) => {
										let status = taskList.status

										if (reponseObj.xAxis.min != '' && reponseObj.xAxis.max != '') {
											if (moment(reponseObj.xAxis.min) > moment(taskList.startDate)) {
												reponseObj.xAxis.min = taskList.startDate
											}
											if (moment(reponseObj.xAxis.max) > moment(taskList.endDate)) {
											} else {
												reponseObj.xAxis.max = taskList.endDate
											}
										} else {
											reponseObj.xAxis.min = taskList.startDate
											reponseObj.xAxis.max = taskList.endDate
										}

										let color = ''
										if (status == CONSTANTS.common.STARTED) {
											color = '#f5f5f5'
										} else if (status == CONSTANTS.common.SUBMITTED_STATUS) {
											color = '#20ba8d'
										} else if (status == CONSTANTS.common.INPROGRESS_STATUS) {
											color = '#ef8c2b'
										}
										let obj = {
											name: taskList.name,
											id: taskList._id,
											color: color,
											start: moment.utc(taskList.startDate).valueOf(),
											end: moment.utc(taskList.endDate).valueOf(),
										}

										reponseObj.xAxis.min = moment.utc(reponseObj.xAxis.min).valueOf('YYYY,mm,DD')
										reponseObj.xAxis.max = moment.utc(reponseObj.xAxis.max).valueOf('YYYY,mm,DD')
										reponseObj.series[0].data.push(obj)
									})
								)
								chartObject.push(reponseObj)
							}
						})
					)
					resolve({
						success: true,
						message: CONSTANTS.apiResponses.REPORT_GENERATED,
						data: chartObject,
					})
				}
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

/**
 * Get date range for report
 * @method
 * @name _getDateRangeofReport
 * @param {String} reportType - type of report
 * @returns {Object} - returns start and end date
 */
function _getDateRangeofReport(reportType) {
	let startFrom = ''
	let endOf = ''
	if (reportType == 0) {
		let today = moment()
		startFrom = today.startOf('week').format('YYYY-MM-DD')
		endOf = today.endOf('week').format('YYYY-MM-DD')
	} else if (reportType == 1) {
		endOf = moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD')
		startFrom = moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD')
	} else {
		startFrom = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD')
		endOf = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD')
	}
	return { startFrom: startFrom, endOf: endOf }
}

/**
 * Get overdue status
 * @method
 * @name _getOverdueStatus
 * @param {String} endDate - date that task or project suppose to be finished.
 * @returns {Boolean} - returns overdue status
 */

function _getOverdueStatus(endDate) {
	let overdue = false
	let today = moment().format()
	let endDateObject = moment(endDate, 'YYYY-MM-DD')

	//Find difference between present date and end date
	if (endDateObject.diff(today, 'days') < 1) {
		overdue = true
	}

	return overdue
}
