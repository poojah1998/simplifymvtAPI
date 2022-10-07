const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, json, printf } = format;
const fs = require('fs')

const Logger = function() {
    return createLogger({
        // level: 'info',
        format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            json()
        ),
        // defaultMeta: { service: 'user-service' },
        transports: [
            new transports.File({ filename: 'logging-info.log', level: 'info' })
        ],


    });

}

module.exports.getLogs = (req, res, next) => {
    var fileData = []
    try {
        const { id } = req.params
        console.log("User Id", id)
        logFileData = fs.readFileSync('logging-info.log', 'utf8');
        var jsonLogData = JSON.parse('[' + (logFileData.split('\r\n').filter(String)).join(',') + ']');
        jsonLogData.forEach(element => {
            if (element.id == id) {
                fileData.push(element)
            }
        });
        res.send(fileData).status(200)
    } catch (err) {
        console.log("Error : ", err)
    }
}

module.exports = Logger()