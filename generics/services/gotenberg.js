/**
 * Generates options for making a request to Gotenberg service to convert HTML content.
 * @returns {Object} The options object for the HTTP request.
 */
function getGotenbergConnection() {
	let options = {
		method: 'POST',
		uri: process.env.GOTENBERG_URL + '/forms/chromium/convert/html',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		resolveWithFullResponse: true,
		encoding: null,
		json: true,
		formData: '',
	}

	return options
}

module.exports = {
	getGotenbergConnection: getGotenbergConnection,
}
