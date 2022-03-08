// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.operatorLogFilePath = "./logs/OPERATOR_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Operator = function () {
};

// routing
var operator = new Operator();

module.exports.route = function (app) {
    app.post(PATH + 'tp_operator_identify', operator.tpOperatorIdentify);
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


function processOperatorIdentify(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var mobileNo = req.params.mobileNo;
    var country = req.params.country;

    var payloadReqObj = {
        "mobileNo": mobileNo,
        "country": country,
        "srcuid": srcuid,
        "srcpwd": srcpwd,
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        // console.log('resultPayload ', resultPayload);
        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        var reqObj = {
            'payload': resultPayload
        };

        request({
            method: 'post',
            url: TP_OPERATOR_IDENTIFY,
            form: JSON.stringify(reqObj),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            // console.log('error:', err); // Print the error if one occurred
            // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

            var apiResponse = body;

            if (err) {
                logText += 'TP_OPERATOR_IDENTIFY err resp: ' + JSON.stringify(err) + logSeparator;
                fmm.logWrite(logText, operatorLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                if (apiResponse.status === 200) {
                    var operator = apiResponse.data.operator;
                    logText += 'TP_OPERATOR_IDENTIFY success ' + operator + logSeparator;
                    var response = new Response({'operator': operator});
                    res.send(response);

                } else {

                    var response = new Response(apiResponse);
                    res.send(response);
                }

                logText += 'TP_OPERATOR_IDENTIFY resp: ' + JSON.stringify(apiResponse) + logSeparator + ' err: ' + err;
                fmm.logWrite(logText, operatorLogFilePath);
            }

        });

    }, function (err) {

        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, operatorLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};

Operator.prototype.tpOperatorIdentify = function (req, res, next) {
    processOperatorIdentify(req, res, next);
    return next();
};