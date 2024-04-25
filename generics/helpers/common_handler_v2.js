const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas')
const width = 800 //px
const height = 450 //px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })
const path = require('path')
const rimraf = require('rimraf')
const ejs = require('ejs')
const request = require('request')
const rp = require('request-promise')
const filesHelper = require('../../module/files/helper')

exports.unnatiEntityReportPdfGeneration = async function (entityReportData) {
	console.log(entityReportData, 'line no 11')

	return new Promise(async function (resolve, reject) {
		console.log('--------yyy---')

		let currentTempFolder = 'tmp/' + uuidv4() + '--' + Math.floor(Math.random() * (10000 - 10 + 1) + 10)
		console.log('line no 18')
		let imgPath = __dirname + '/../' + currentTempFolder

		if (!fs.existsSync(imgPath)) {
			fs.mkdirSync(imgPath)
		}

		const sourceBootstrapPath = path.join(__dirname, '../../public/css/bootstrap.min.css')
		const destinationStylePath = path.join(imgPath, 'style.css')
		console.log(sourceBootstrapPath, destinationStylePath, 'line no 25')
		await copyBootStrapFile(sourceBootstrapPath, destinationStylePath)

		// let bootstrapStream = await copyBootStrapFile(__dirname + '/../public/css/bootstrap.min.css', imgPath + '/style.css');
		try {
			console.log('kkkkkkkkkkkkkkkkkkk')
			let formData = []
			//copy images from public folder
			let imgSourcePaths = [
				'/../public/images/note1.svg',
				'/../public/images/note2.svg',
				'/../public/images/note3.svg',
				'/../public/images/note4.svg',
			]
			console.log(imgSourcePaths, 'line no 35')
			for (let i = 0; i < imgSourcePaths.length; i++) {
				let imgName = 'note' + (i + 1) + '.svg'
				console.log(imgName, 'line no 39')
				let src = path.join(__dirname, '..', imgSourcePaths[i])
				console.log(src, 'line no 41')
				fs.copyFileSync(src, imgPath + ('/' + imgName))
				console.log(imgPath, 'line no 43')
				formData.push({
					value: fs.createReadStream(imgPath + ('/' + imgName)),
					options: {
						filename: imgName,
					},
				})
				console.log('line no 50')
			}
			console.log('line no 52')
			//get the chart object
			let chartData = await getEntityReportChartObjects(entityReportData)
			console.log(chartData, 'line no 62')
			//generate the chart using highchart server
			let entityReportCharts = await createChart(chartData, imgPath)
			console.log(entityReportCharts, 'line no 65')
			formData.push(...entityReportCharts)

			let ejsInputData = {
				chartData: entityReportCharts,
				response: entityReportData,
			}
			console.log(ejsInputData, 'line no 72')

			ejs.renderFile(path.join(__dirname, '../../views/unnatiEntityReport.ejs'), {
				data: ejsInputData,
			}).then(function (dataEjsRender) {
				let dir = imgPath
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir)
				}

				fs.writeFile(dir + '/index.html', dataEjsRender, function (errWriteFile, dataWriteFile) {
					if (errWriteFile) {
						throw errWriteFile
					} else {
						let optionsHtmlToPdf = UTILS.getGotenbergConnection()
						console.log(optionsHtmlToPdf, 'line no 86')
						optionsHtmlToPdf.formData = {
							files: [],
						}
						formData.push({
							value: fs.createReadStream(dir + '/index.html'),
							options: {
								filename: 'index.html',
							},
						})

						formData.push({
							value: fs.createReadStream(dir + '/style.css'),
							options: {
								filename: 'style.css',
							},
						})

						optionsHtmlToPdf.formData.files = formData
						console.log(optionsHtmlToPdf, 'line no 104')
						rp(optionsHtmlToPdf)
							.then(function (responseHtmlToPdf) {
								let pdfBuffer = Buffer.from(responseHtmlToPdf.body)
								if (responseHtmlToPdf.statusCode == 200) {
									console.log('line no 114444')
									let pdfFile = uuidv4() + '.pdf'
									console.log('path were the pdf is stored in the local')
									fs.writeFile(dir + '/' + pdfFile, pdfBuffer, 'binary', async function (err) {
										if (err) {
											return console.log(err)
										} else {
											let uploadFileResponse = await uploadPdfToCloud(pdfFile, dir)
											console.log(uploadFileResponse, 'line no 122')
											if (uploadFileResponse.success) {
												console.log('line no 124')
												let pdfDownloadableUrl = await getDownloadableUrl(
													uploadFileResponse.data
												)

												if (
													pdfDownloadableUrl.success &&
													pdfDownloadableUrl.data.result &&
													Object.keys(pdfDownloadableUrl.data.result).length > 0
												) {
													fs.readdir(imgPath, (err, files) => {
														if (err) throw err

														let i = 0
														for (const file of files) {
															fs.unlink(path.join(imgPath, file), (err) => {
																if (err) throw err
															})

															if (i == files.length) {
																fs.unlink('../../' + currentTempFolder, (err) => {
																	if (err) throw err
																})
																console.log(
																	'path.dirname(filename).split(path.sep).pop()',
																	path.dirname(file).split(path.sep).pop()
																)
															}

															i = i + 1
														}
													})
													rimraf(imgPath, function () {
														console.log('done')
													})

													return resolve({
														status: filesHelper.status_success,
														message: filesHelper.pdf_report_generated,
														pdfUrl: pdfDownloadableUrl.data.result.url,
													})
												} else {
													return resolve({
														status: filesHelper.status_failure,
														message: pdfDownloadableUrl.message
															? pdfDownloadableUrl.message
															: filesHelper.could_not_generate_pdf,
														pdfUrl: '',
													})
												}
											} else {
												return resolve({
													status: filesHelper.status_failure,
													message: uploadFileResponse.message
														? uploadFileResponse.message
														: filesHelper.could_not_generate_pdf,
													pdfUrl: '',
												})
											}
										}
									})
								}
							})
							.catch((err) => {
								console.log(err, 'line no 185')
								resolve(err)
							})
					}
				})
			})
		} catch (err) {
			return reject(err)
		}
	})
}

exports.unnatiViewFullReportPdfGeneration = async function (responseData) {
	console.log(responseData, 'im in the unnatiViewFullReportPdfGeneration function')
	return new Promise(async function (resolve, reject) {
		var currentTempFolder = 'tmp/' + uuidv4() + '--' + Math.floor(Math.random() * (10000 - 10 + 1) + 10)

		var imgPath = __dirname + '/../' + currentTempFolder

		if (!fs.existsSync(imgPath)) {
			fs.mkdirSync(imgPath)
		}
		const sourceBootstrapPath = path.join(__dirname, '../../public/css/bootstrap.min.css')
		const destinationStylePath = path.join(imgPath, 'style.css')
		console.log(sourceBootstrapPath, destinationStylePath, 'line no 212')
		let bootstrapStream = await copyBootStrapFile(sourceBootstrapPath, destinationStylePath)
		// let bootstrapStream = await copyBootStrapFile(__dirname + '/../public/css/bootstrap.min.css', imgPath + '/style.css');

		try {
			var FormData = []
			const dataArray = Object.entries(responseData)
			console.log(dataArray, 'line no 220')
			//get the chart object
			let chartObj = await ganttChartObject(dataArray)

			//generate the chart using highchart server
			let ganttChartData = await createChart(chartObj[0], imgPath)

			FormData.push(...ganttChartData)

			let obj = {
				chartData: ganttChartData,
				reportType: responseData.reportType,
				projectData: chartObj[1],
				chartLibrary: 'chartjs',
			}

			ejs.renderFile(__dirname + '/../views/unnatiViewFullReport.ejs', {
				data: obj,
			}).then(function (dataEjsRender) {
				var dir = imgPath
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir)
				}

				fs.writeFile(dir + '/index.html', dataEjsRender, function (errWriteFile, dataWriteFile) {
					if (errWriteFile) {
						throw errWriteFile
					} else {
						let optionsHtmlToPdf = gen.utils.getGotenbergConnection()
						optionsHtmlToPdf.formData = {
							files: [],
						}
						FormData.push({
							value: fs.createReadStream(dir + '/index.html'),
							options: {
								filename: 'index.html',
							},
						})

						FormData.push({
							value: fs.createReadStream(dir + '/style.css'),
							options: {
								filename: 'style.css',
							},
						})

						optionsHtmlToPdf.formData.files = FormData

						rp(optionsHtmlToPdf)
							.then(function (responseHtmlToPdf) {
								let pdfBuffer = Buffer.from(responseHtmlToPdf.body)
								if (responseHtmlToPdf.statusCode == 200) {
									let pdfFile = uuidv4() + '.pdf'
									fs.writeFile(dir + '/' + pdfFile, pdfBuffer, 'binary', async function (err) {
										if (err) {
											return console.log(err)
										} else {
											let uploadFileResponse = await uploadPdfToCloud(pdfFile, dir)

											if (uploadFileResponse.success) {
												let pdfDownloadableUrl = await getDownloadableUrl(
													uploadFileResponse.data
												)

												if (
													pdfDownloadableUrl.success &&
													pdfDownloadableUrl.data.result &&
													Object.keys(pdfDownloadableUrl.data.result).length > 0
												) {
													fs.readdir(imgPath, (err, files) => {
														if (err) throw err

														let i = 0
														for (const file of files) {
															fs.unlink(path.join(imgPath, file), (err) => {
																if (err) throw err
															})

															if (i == files.length) {
																fs.unlink('../../' + currentTempFolder, (err) => {
																	if (err) throw err
																})
																console.log(
																	'path.dirname(filename).split(path.sep).pop()',
																	path.dirname(file).split(path.sep).pop()
																)
															}

															i = i + 1
														}
													})
													rimraf(imgPath, function () {
														console.log('done')
													})

													return resolve({
														status: filesHelper.status_success,
														message: filesHelper.pdf_report_generated,
														pdfUrl: pdfDownloadableUrl.data.result.url,
													})
												} else {
													return resolve({
														status: filesHelper.status_failure,
														message: pdfDownloadableUrl.message
															? pdfDownloadableUrl.message
															: filesHelper.could_not_generate_pdf,
														pdfUrl: '',
													})
												}
											} else {
												return resolve({
													status: filesHelper.status_failure,
													message: uploadFileResponse.message
														? uploadFileResponse.message
														: filesHelper.could_not_generate_pdf,
													pdfUrl: '',
												})
											}
										}
									})
								}
							})
							.catch((err) => {
								resolve(err)
							})
					}
				})
			})
		} catch (err) {
			resolve(err)
		}
	})
}

async function ganttChartObject(projects) {
	console.log(projects, 'line no 358')

	return new Promise(async function (resolve, reject) {
		let arrayOfChartData = []
		let projectData = []
		let i = 1

		await Promise.all(
			projects.map(async (eachProject) => {
				let data = []
				let labels = []
				let leastStartDate = ''

				await Promise.all(
					eachProject.tasks.map((eachTask) => {
						if (eachTask.startDate) {
							leastStartDate = eachTask.startDate
						}
						labels.push(eachTask.title)
						data.push({
							task: eachTask.title,
							startDate: eachTask.startDate,
							endDate: eachTask.endDate,
						})
					})
				)

				if (data.length > 0) {
					data.forEach((v) => {
						leastStartDate = new Date(v.startDate) < new Date(leastStartDate) ? v.startDate : leastStartDate
					})
				}

				let chartOptions = {
					order: 1,
					options: {
						type: 'horizontalBar',
						data: {
							labels: labels,
							datasets: [
								{
									data: data.map((t) => {
										if (leastStartDate && t.startDate) {
											return dateDiffInDays(new Date(leastStartDate), new Date(t.startDate))
										}
									}),
									datalabels: {
										color: '#025ced',
										//   formatter: function (value, context) {
										//     return '';
										//   },
									},
									backgroundColor: 'rgba(63,103,126,0)',
									hoverBackgroundColor: 'rgba(50,90,100,0)',
								},
								{
									data: data.map((t) => {
										if (t.startDate && t.endDate) {
											return dateDiffInDays(new Date(t.startDate), new Date(t.endDate))
										}
									}),
									datalabels: {
										color: '#025ced',
										//   formatter: function (value, context) {
										//     return '';
										//   },
									},
								},
							],
						},
						options: {
							maintainAspectRatio: false,
							title: {
								display: true,
								text: eachProject.title,
							},
							legend: { display: false },
							scales: {
								xAxes: [
									{
										stacked: true,
										ticks: {
											callback: function (value, index, values) {
												if (leastStartDate) {
													const date = new Date(leastStartDate)
													date.setDate(value)
													return getDate(date)
												}
											},
										},
									},
								],
								yAxes: [
									{
										stacked: true,
									},
								],
							},
						},
					},
				}

				arrayOfChartData.push(chartOptions)
				eachProject.order = i
				projectData.push(eachProject)
				i++
			})
		)

		resolve([arrayOfChartData, projectData])
	})
}

const createChart = async function (chartData, imgPath) {
	return new Promise(async function (resolve, reject) {
		try {
			let formData = []

			await Promise.all(
				chartData.map(async (data) => {
					let chartImage = 'chartPngImage_' + uuidv4() + '_.png'

					let imgFilePath = imgPath + '/' + chartImage
					let imageBuffer = await chartJSNodeCanvas.renderToBuffer(data.options)
					fs.writeFileSync(imgFilePath, imageBuffer)

					formData.push({
						order: data.order,
						value: fs.createReadStream(imgFilePath),
						options: {
							filename: chartImage,
						},
					})
				})
			)

			return resolve(formData)
		} catch (err) {
			return reject(err)
		}
	})
}

const uploadPdfToCloud = async function (fileName, folderPath) {
	return new Promise(async function (resolve, reject) {
		try {
			let getSignedUrl = await FilesHelper.getPreSignedUrl(fileName)

			if (getSignedUrl.result && Object.keys(getSignedUrl.result).length > 0) {
				let fileUploadUrl = getSignedUrl.result[Object.keys(getSignedUrl.result)[0]].files[0].url
				let fileData = fs.readFileSync(folderPath + '/' + fileName)

				try {
					await request({
						url: fileUploadUrl,
						method: 'put',
						headers: {
							'x-ms-blob-type':
								getSignedUrl.result[Object.keys(getSignedUrl.result)[0]].files[0].cloudStorage ==
								filesHelper.azure
									? 'BlockBlob'
									: null,
							'Content-Type': 'multipart/form-data',
						},
						body: fileData,
					})

					return resolve({
						success: true,
						data: getSignedUrl.result[Object.keys(getSignedUrl.result)[0]].files[0].payload.sourcePath,
					})
				} catch (e) {
					console.log(e)
				}
			} else {
				return resolve({
					success: false,
				})
			}
		} catch (err) {
			return resolve({
				success: false,
				message: err.message,
			})
		}
	})
}

async function copyBootStrapFile(from, to) {
	console.log('line no 188')
	// var fileInfo = await rp(options).pipe(fs.createWriteStream(radioFilePath))
	var readCss = fs.createReadStream(from).pipe(fs.createWriteStream(to))
	return new Promise(function (resolve, reject) {
		readCss.on('finish', function () {
			// console.log("readCss", readCss);
			return resolve(readCss)
		})
		readCss.on('error', function (err) {
			// return resolve(fileInfo);
			// console.log("err--", err);
			return resolve(err)
		})
	})
}

async function getEntityReportChartObjects(data) {
	console.log(data, 'line no 201')
	return new Promise(async function (resolve, reject) {
		let chartData = []

		let getChartObjects = [getTaskOverviewChart(data.tasks), getCategoryWiseChart(data.categories)]

		await Promise.all(getChartObjects).then(function (response) {
			chartData.push(response[0])
			chartData.push(response[1])
		})

		return resolve(chartData)
	})
}

async function getCategoryWiseChart(categories) {
	return new Promise(async function (resolve, reject) {
		let total = categories['Total']
		delete categories['Total']
		let labels = []
		let data = []

		Object.keys(categories).forEach((eachCategory) => {
			let percetage = ((categories[eachCategory] / total) * 100).toFixed(1)
			labels.push(eachCategory)
			data.push(percetage)
		})

		let chartOptions = {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: [
							'rgb(255, 99, 132)',
							'rgb(54, 162, 235)',
							'rgb(255, 206, 86)',
							'rgb(231, 233, 237)',
							'rgb(75, 192, 192)',
							'rgb(151, 187, 205)',
							'rgb(220, 220, 220)',
							'rgb(247, 70, 74)',
							'rgb(70, 191, 189)',
							'rgb(253, 180, 92)',
							'rgb(148, 159, 177)',
							'rgb(77, 83, 96)',
							'rgb(95, 101, 217)',
							'rgb(170, 95, 217)',
							'rgb(140, 48, 57)',
							'rgb(209, 6, 40)',
							'rgb(68, 128, 51)',
							'rgb(125, 128, 51)',
							'rgb(128, 84, 51)',
							'rgb(179, 139, 11)',
						],
					},
				],
			},
			options: {
				legend: {
					position: 'bottom',
					labels: {
						padding: 30,
					},
				},
				layout: {
					padding: {
						top: 15,
						bottom: 25,
					},
				},
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'end',
						font: {
							size: 18,
						},
						formatter: (value) => {
							return value + '%'
						},
					},
				},
			},
		}

		let chartObject = {
			order: 2,
			options: chartOptions,
		}
		resolve(chartObject)
	})
}

async function getTaskOverviewChart(tasks) {
	return new Promise(async function (resolve, reject) {
		let total = tasks['Total']
		delete tasks['Total']

		let labels = []
		let data = []
		let backgroundColor = []

		if (tasks['Completed']) {
			labels.push('Completed')
			data.push(((tasks['Completed'] / total) * 100).toFixed(1))
			backgroundColor.push('#295e28')
			delete tasks['Completed']
		}

		if (tasks['Not Started']) {
			labels.push('Not Started')
			data.push(((tasks['Not Started'] / total) * 100).toFixed(1))
			backgroundColor.push('#db0b0b')
			delete tasks['Not Started']
		}

		Object.keys(tasks).forEach((eachTask) => {
			let percetage = ((tasks[eachTask] / total) * 100).toFixed(1)
			labels.push(eachTask)
			data.push(percetage)
		})

		backgroundColor = [
			...backgroundColor,
			...[
				'rgb(255, 99, 132)',
				'rgb(54, 162, 235)',
				'rgb(255, 206, 86)',
				'rgb(231, 233, 237)',
				'rgb(75, 192, 192)',
				'rgb(151, 187, 205)',
				'rgb(220, 220, 220)',
				'rgb(247, 70, 74)',
				'rgb(70, 191, 189)',
				'rgb(253, 180, 92)',
				'rgb(148, 159, 177)',
				'rgb(77, 83, 96)',
				'rgb(95, 101, 217)',
				'rgb(170, 95, 217)',
				'rgb(140, 48, 57)',
				'rgb(209, 6, 40)',
				'rgb(68, 128, 51)',
				'rgb(125, 128, 51)',
				'rgb(128, 84, 51)',
				'rgb(179, 139, 11)',
			],
		]

		let chartOptions = {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
						backgroundColor: backgroundColor,
					},
				],
			},
			options: {
				cutoutPercentage: 80,
				legend: {
					position: 'bottom',
					labels: {
						padding: 30,
					},
				},
				layout: {
					padding: {
						top: 25,
					},
				},
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'end',
						font: {
							size: 18,
						},
						formatter: (value) => {
							return value + '%'
						},
					},
				},
			},
		}

		let chartObject = {
			order: 1,
			options: chartOptions,
		}

		resolve(chartObject)
	})
}
