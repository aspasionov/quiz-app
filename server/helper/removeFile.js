const fs = require("fs")

const removeFile = (pathToFile) => {
    fs.unlink(pathToFile, function (err) {
        if (err) {
            throw err
        }
    })
}

module.exports = removeFile