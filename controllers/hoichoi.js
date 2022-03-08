// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.hoichoiLogFilePath = "./logs/HOICHOI_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Hoichoi = function () {
};

// routing
var hoichoi = new Hoichoi();

module.exports.route = function (app) {
    app.post(PATH + 'hoichoi_product_show', hoichoi.hoichoiProductShow);
    app.post(PATH + 'hoichoi_product_request', hoichoi.hoichoiProductRequest);
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

function processHoichoiProductShow(req, res, next) {

    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request
    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator + 'nonce: ' + myNonce + logSeparator;

    var pUserId = PRODUCT_SHOW_USERID_LOCAL; // Staging
    if (IS_PRODUCTION == true) { // Production
        pUserId = PRODUCT_SHOW_USERID_LIVE;
    }

    var payloadReqObj = {
        "userId": pUserId,
        "addCommission": req.params.addCommission, // values('yes'/'no')
        "nonce": myNonce, // optional, unique value to identify duplicate request
        "filters": {
            "categoryId": 13 // CategoryId 13 is fixed for HOICHOI only
        },
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
            url: TP_PRODUCT_SHOW,
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

                logText += 'TP_PRODUCT_SHOW HOICHOI err resp: ' + err;
                fmm.logWrite(logText, hoichoiLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'TP_PRODUCT_SHOW HOICHOI resp: ' + JSON.stringify(apiResponse);
                fmm.logWrite(logText, hoichoiLogFilePath);
                var response = new Response(apiResponse);
                res.send(response);
            }


        });

    }, function (err) {

        logText += 'getEncryptedPayload callback err: ' + err;
        fmm.logWrite(logText, hoichoiLogFilePath);
        var response = new Response(err);
        res.send(response);
    });

    return next();
};

function processHoichoiProductRequest(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request
    let walletTypeId = req.params.walletTypeId;

    if (func.inArray(walletTypeId, predefinedWalletTypeIds) === false) {
        logText += "HOICHOI_PRODUCT_REQUEST: walletTypeId mismatch.";
        fmm.logWrite(logText, hoichoiLogFilePath);

        res.send(new Response({
            "status": 500,
            "error": "walletTypeId mismatch."
        }));
    }

    func.AuthTokenGenerator(AUTH_TOKEN_GENERATE_API, function (err, accessToken) {

        if (err) {

            logText += 'AuthTokenGenerator generate err: ' + err + logSeparator + 'accessTokenResult: ' + accessToken;
            fmm.logWrite(logText, hoichoiLogFilePath);
            var response = new Response(err);
            res.send(response);

        } else {

            var payloadReqObj = {
                "srcuid": srcuid,
                "srcpwd": srcpwd,
                "productId": req.params.productId,
                // "productCategoryId": req.params.productCategoryId,
                "productCategoryId": hoichoiProductCategory, // could be change for anytime,
                "customer_tid": req.params.customer_tid,
                "channel": (typeof req.params.channel !== 'undefined') ? req.params.channel : apiChannel,
                "walletTypeId": walletTypeId,
                "nonce": myNonce,
            };

            func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

                logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator + "accessToken: " + accessToken + logSeparator;

                var reqObj = {
                    'payload': resultPayload,
                };

                request({
                    method: 'post',
                    url: HOICHOI_PRODUCT_REQUEST,
                    json: true,
                    form: JSON.stringify(reqObj),
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + accessToken
                    },
                }, function (err, httpResponse, body) {

                    // console.log('error:', err); // Print the error if one occurred
                    // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the Google homepage.

                    var apiResponse = body;

                    if (err) {
                        logText += 'HOICHOI_PRODUCT_REQUEST err resp: ' + ' err: ' + err;
                        fmm.logWrite(logText, hoichoiLogFilePath);
                        var response = new Response(err);
                        res.send(response);
                    } else {

                        logText += 'HOICHOI_PRODUCT_REQUEST resp: ' + JSON.stringify(apiResponse) + logSeparator + ' err: ' + err;
                        fmm.logWrite(logText, hoichoiLogFilePath);
                        var response = new Response(apiResponse);
                        res.send(response);
                    }

                });

            }, function (err) {

                logText += 'getEncryptedPayload callback err: ' + err;
                fmm.logWrite(logText, hoichoiLogFilePath);
                var response = new Response(err);
                res.send(response);
            });
        }

    }, function (err) {

        // console.log('err ', err);
        logText += 'AuthTokenGenerator callback err: ' + err;
        fmm.logWrite(logText, hoichoiLogFilePath);
        var response = new Response(err);
        res.send(response);
    });

    return next();
};

Hoichoi.prototype.hoichoiProductShow = function (req, res, next) {
    processHoichoiProductShow(req, res, next);
    return next();
};

Hoichoi.prototype.hoichoiProductRequest = function (req, res, next) {
    processHoichoiProductRequest(req, res, next);
    return next();
};