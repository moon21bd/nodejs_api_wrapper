const log = require('log-to-file');
const fs = require('fs');

exports.logWrite = function (logtxt, filePath) {

    try {
        if (fs.existsSync(filePath)) {

            if (global.logEnable) {
                log(logtxt, filePath);
            }
        } else {

            fs.closeSync(fs.openSync(filePath, 'w'));
            if (global.logEnable) {
                log(logtxt, filePath);
            }
        }
    } catch (err) {
        console.error(err)
    }
};
