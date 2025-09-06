// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');

global.smsLogFilePath = "./logs/SMS_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var SMS = function () {
};

// routing
var sms = new SMS();

module.exports.route = function (app) {
    app.post(PATH + 'send_sms', sms.sendSms);
};

// controller

function Response(arg) {
    this.response = arg;
}

function ResponseBuilder() {

}

ResponseBuilder.prototype.setSuccessMsg = function (successMsg) {
    if (successMsg) {
        this.success = successMsg;
    }
};

ResponseBuilder.prototype.setErrorMsg = function (errorMsg) {
    if (errorMsg) {
        this.error = errorMsg;
    }
};

ResponseBuilder.prototype.setData = function (data) {
    if (data) {
        this.data = data;
    }
};


function processSendSms(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + "processSendSms CALLED " + logSeparator + JSON.stringify(req.params) + logSeparator;

    var status = req.params.status;
    var transactionId = req.params.transactionId;
    var userName = req.params.userName;
    var message = req.params.message;

    var smsText;

    if (status == 1) { // Success
        smsText = "Your Transaction is successful. Your Transaction ID: " + transactionId + ". For details please click the link " + vivrSiteLink;
    } else { // Failed
        smsText = "Your Transaction is not successful. Your Transaction ID: " + transactionId + ". To get support please click the link " + vivrSiteLink;
    }

    // send sms url
    var SEND_SMS_URL = "https://api.example.com/smsSend.php";

    var reqURL = SEND_SMS_URL + "?ano=" + userName + "&text=" + encodeURI(smsText);
    logText += 'reqURL: ' + reqURL + logSeparator + smsText + logSeparator;

    const options = {
        url: reqURL,
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    };

    request(options, function (err, httpResponse, body) {

        if (err) {
            logText += 'SEND_SMS_URL response err: ' + err;
            fmm.logWrite(logText, smsLogFilePath);

            var response = new Response(err);
            res.send(response);
        } else {
            var resp = body;
            logText += 'SEND_SMS_URL response: ' + resp + logSeparator;
            fmm.logWrite(logText, smsLogFilePath);

            var response = new Response(resp);
            res.send(response);
        }

    });

    return next();
};

SMS.prototype.sendSms = function (req, res, next) {
    processSendSms(req, res, next);
    return next();
};
