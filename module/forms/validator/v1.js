module.exports = (req) => {
	let formsValidator = {
		create: function () {
			req.checkBody('type').exists().withMessage('required form type')
			req.checkBody('subType').exists().withMessage('required form subType')
		},
		update: function () {
			req.checkParams('_id').exists().withMessage('required forms id')
		},
	}

	if (formsValidator[req.params.method]) {
		formsValidator[req.params.method]()
	}
}
