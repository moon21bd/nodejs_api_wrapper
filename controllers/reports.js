// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.reportsLogFilePath = "./logs/REPORTS_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Reports = function () {
};

// routing
var reports = new Reports();

module.exports.route = function (app) {
    app.post(PATH + 'reports_generate', reports.reportsGenerate);
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

function processReportsGenerate(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "srcuid": srcuid,
        "srcpwd": srcpwd,
        "userId": req.params.userId,
        "startDate": req.params.startDate,
        "endDate": req.params.endDate,
        "timezone": req.params.timezone,
        // "reportedUserId": reportedUserId,
        // "reportedUserId": req.params.reportedUserId,
        // "additionalFilters": req.params.additionalFilters,
        // "cacheEnable": req.params.cacheEnable,
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        // console.log('resultPayload res ', resultPayload);
        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        var startFrom = req.params.start;
        var lengthTo = req.params.length;
        var reqURL = TP_REPORTS_GENERATE + "?payload=" + resultPayload + "&start=" + startFrom + "&length=" + lengthTo;
        // console.log('reqURL ', reqURL);
        logText += "reqAPIURL " + reqURL + logSeparator;

        const options = {
            url: reqURL,
            method: 'GET',
            json: true,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };

        request(options, function (err, httpResponse, body) {

            if (err) {
                logText += 'TP_REPORTS_GENERATE resp err: ' + err + logSeparator;
                fmm.logWrite(logText, reportsLogFilePath);

                var response = new Response(err);
                res.send(response);
            } else {

                // const jsonText = JSON.stringify(body);
                // const responseObject = JSON.parse(jsonText);
                // console.log('responseObject ', body)

                logText += 'TP_REPORTS_GENERATE response: ' + body + logSeparator;
                fmm.logWrite(logText, reportsLogFilePath);
                var response = new Response(body);
                res.send(response);
            }

        });


    }, function (err) {
        // console.log('payloadErr ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, reportsLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};


Reports.prototype.reportsGenerate = function (req, res, next) {

    processReportsGenerate(req, res, next);
    return next();
};