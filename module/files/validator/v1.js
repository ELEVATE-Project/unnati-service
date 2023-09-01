module.exports = (req) => {

    let filesValidator = {
        preSignedUrls : function() {
            req.checkBody('files').exists().withMessage("files data is required");
        },
        getDownloadableUrl: function () {
            req.checkBody('filePaths').exists().withMessage("files data is required");
            req.checkBody('filePaths').isArray().withMessage("files should be an array");
            req.checkBody('filePaths').notEmpty().withMessage("files array should not be empty");
        }     
    }

    if (filesValidator[req.params.method]) {
        filesValidator[req.params.method]();
    }

};