// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.topUpLogFilePath = "./logs/TOP_UP_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var TopUp = function () {

};

// routing
var topup = new TopUp();

module.exports.route = function (app) {
    app.post(PATH + 'topup_check', topup.topUpCheck);
    app.post(PATH + 'topup_request', topup.topUpRequest);
    app.post(PATH + 'topup_status', topup.topUpStatus);
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


function processTopUpStatus(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "tid": req.params.tid, // TID that was provided at the time of recharge
        "customer_tid": req.params.customer_tid, // optional
        "srcuid": srcuid,
        "srcpwd": srcpwd,
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        var reqObj = {
            'payload': resultPayload,
        };

        request({
            method: 'post',
            url: TOP_UP_STATUS,
            form: JSON.stringify(reqObj),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            var apiResponse = body;
            var response = new Response(apiResponse);
            res.send(response);

            logText += 'TOP_UP_STATUS resp: ' + JSON.stringify(apiResponse) + logSeparator + ' err: ' + err;
            fmm.logWrite(logText, topUpLogFilePath);

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'GET_ENCRYPTED_PAYLOAD_CALLBACK_ERR: ' + err + logSeparator;
        var response = new Response(err);
        res.send(response);
        fmm.logWrite(logText, topUpLogFilePath);
    });

    return next();
};

function processTopUpRequest(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    let walletTypeId = req.params.walletTypeId;
    if (func.inArray(walletTypeId, predefinedWalletTypeIds) === false) {
        logText += "TopUpRequest: walletTypeId mismatch.";
        fmm.logWrite(logText, topUpLogFilePath);

        res.send(new Response({
            "status": 500,
            "error": "walletTypeId mismatch."
        }));
    }

    var payloadReqObj = {
        "msisdn": req.params.msisdn,
        "amount": req.params.amount,
        "operator": req.params.operator,
        "country": req.params.country,
        "type": req.params.type.toUpperCase(), // type case-sensitive allowed type is mandatory for Bangladeshi msisdn.
        "customer_tid": req.params.customer_tid, // optional
        "srcuid": srcuid,
        "srcpwd": srcpwd,
        "channel": (typeof req.params.channel !== 'undefined') ? req.params.channel : apiChannel,
        "walletTypeId": walletTypeId
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        var reqObj = {
            'payload': resultPayload,
        };

        request({
            method: 'post',
            url: TOP_UP_REQUEST,
            form: JSON.stringify(reqObj),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            var apiResponse = body;

            if (err) {
                logText += 'TOP_UP_REQUEST err resp: ' + err;
                fmm.logWrite(logText, topUpLogFilePath);
                var response = new Response(apiResponse);
                res.send(response);
            } else {

                var apiResponse = body;
                logText += 'TOP_UP_REQUEST resp: ' + JSON.stringify(apiResponse) + logSeparator + ' err: ' + err;
                fmm.logWrite(logText, topUpLogFilePath);

                var response = new Response(apiResponse);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'GET_ENCRYPTED_PAYLOAD_CALLBACK_ERR: ' + err + logSeparator;
        var response = new Response(err);
        res.send(response);
        fmm.logWrite(logText, topUpLogFilePath);
    });


    return next();
};

function processTopUpCheck(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "amount": req.params.amount,
        "operator": req.params.operator,
        "country": req.params.country,
        "customer_tid": req.params.customer_tid,
        "type": req.params.type.toUpperCase(), // type case-sensitive allowed type is mandatory for Bangladeshi msisdn.
        "srcuid": srcuid,
        "srcpwd": srcpwd
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        var reqObj = {
            'payload': resultPayload,
        };

        request({
            method: 'post',
            url: TOP_UP_CHECK,
            form: JSON.stringify(reqObj),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            // var apiResponse = body;
            logText += 'TOP_UP_CHECK resp: ' + JSON.stringify(body) + logSeparator + ' err: ' + err;

            if (err) {

                fmm.logWrite(logText, topUpLogFilePath);
                var response = new Response(myObj);
                res.send(response);

            } else {
                let myResponse = body;
                if (myResponse.status === 200) {
                    let custWalletObj = [];
                    let myWalletDetails = myResponse.data.walletDetails;

                    // console.log(myWalletDetails);

                    let operator = myResponse.data.operator;
                    let amount = myResponse.data.amount;
                    let deductible_amount = myResponse.data.deductible_amount;

                    for (let i = 0; i < myWalletDetails.length; i++) {
                        let walletId = myWalletDetails[i];
                        let getWalletTypeId = walletId.walletTypeId;

                        if (func.inArray(getWalletTypeId, predefinedWalletTypeIds)) {
                            custWalletObj.push(walletId);
                        }
                    }

                    let myObj = {
                        status: myResponse.status,
                        data: {
                            "operator": myResponse.data.operator,
                            "amount": myResponse.data.amount,
                            "deductible_amount": myResponse.data.deductible_amount,
                            "walletDetails": custWalletObj,
                        }
                    };

                    logText += 'custom_response: ' + JSON.stringify(myObj) + logSeparator;
                    fmm.logWrite(logText, topUpLogFilePath);

                    var response = new Response(myObj);
                    res.send(response);

                } else {

                    fmm.logWrite(logText, topUpLogFilePath);
                    var response = new Response(myResponse);
                    res.send(response);
                }
            }


        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, topUpLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};


TopUp.prototype.topUpStatus = function (req, res, next) {
    processTopUpStatus(req, res, next);
    return next();
};

TopUp.prototype.topUpRequest = function (req, res, next) {
    processTopUpRequest(req, res, next);
    return next();
};

TopUp.prototype.topUpCheck = function (req, res, next) {
    processTopUpCheck(req, res, next);
    return next();
};