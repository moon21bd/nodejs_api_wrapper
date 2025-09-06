// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.balanceLogFilePath = "./logs/BALANCE_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Balance = function () {
};

// routing
var balance = new Balance();

module.exports.route = function (app) {
    app.post(PATH + 'tp_balance_check', balance.tpBalanceCheck);
    app.post(PATH + 'tp_balance_add', balance.tpBalanceAdd);
    app.post(PATH + 'lattu_balance_add', balance.lattuBalanceAdd);
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


function processBalanceCheck(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "userId": req.params.userId,
        "srcuid": srcuid,
        "srcpwd": srcpwd
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        // console.log('resultPayload ', resultPayload);
        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        request({
            method: 'post',
            url: TP_BALANCE_CHECK,
            form: JSON.stringify({
                'payload': resultPayload,
            }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            const apiResp = body;
            logText += 'TP_BALANCE_CHECK response: ' + JSON.stringify(apiResp) + logSeparator;

            let myResponse = apiResp;
            if (err) {

                logText += 'TP_BALANCE_CHECK err response: ' + JSON.stringify(err) + logSeparator;
                fmm.logWrite(logText, balanceLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {
                if (myResponse.status === 200) {

                    let custWalletObj = [];
                    let myWalletDetails = myResponse.data.walletDetails;
                    let getBalance = myResponse.data.balance;

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
                            "walletDetails": custWalletObj,
                            "balance": getBalance
                        }
                    };

                    logText += 'custom_response: ' + JSON.stringify(myObj) + logSeparator;
                    fmm.logWrite(logText, balanceLogFilePath);

                    var response = new Response(myObj);
                    res.send(response);

                } else {

                    fmm.logWrite(logText, balanceLogFilePath);
                    var response = new Response(myResponse);
                    res.send(response);
                }
            }


        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        var response = new Response(err);
        res.send(response);
        fmm.logWrite(logText, balanceLogFilePath);
    });

    return next();
};

function processBalanceAdd(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    let walletTypeId = req.params.walletTypeId;
    if (func.inArray(walletTypeId, predefinedWalletTypeIds) == false) {
        logText += "BalanceAdd: walletTypeId mismatch.";
        fmm.logWrite(logText, topUpLogFilePath);

        res.send(new Response({
            "status": 500,
            "error": "walletTypeId mismatch."
        }));
    }

    var payloadReqObj = {
        "userId": req.params.userId,
        "srcuid": srcuid,
        "srcpwd": srcpwd,
        "amount": req.params.amount,
        "currencyId": 1, // req.params.currencyId, // currency id (not used at this moment put it always 1 for now
        "walletTypeId": walletTypeId
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        // console.log('resultPayload ', resultPayload);
        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        request({
            method: 'post',
            url: TP_BALANCE_ADD,
            form: JSON.stringify({
                'payload': resultPayload,
            }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            const apiResp = body;
            if (err) {

                logText += 'TP_BALANCE_ADD response err: ' + err + logSeparator;
                fmm.logWrite(logText, balanceLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'TP_BALANCE_ADD response: ' + JSON.stringify(apiResp) + logSeparator;
                fmm.logWrite(logText, balanceLogFilePath);

                var response = new Response(apiResp);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        var response = new Response(err);
        res.send(response);
        fmm.logWrite(logText, balanceLogFilePath);
    });

    return next();
};


function processLattuBalanceAdd(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    AuthTokenGeneratorForLattu(AUTH_TOKEN_GENERATE_API, function (err, accessToken) {

        var mySrc, myPwd;
        if (IS_PRODUCTION) {
            mySrc = "lattu_referral";
            myPwd = "referral_lattu_random_9362";
        } else {
            mySrc = srcuid;
            myPwd = srcpwd;
        }

        logText += "IS_PRODUCTION " + IS_PRODUCTION + logSeparator + ' srcuid : ' + mySrc + logSeparator + ' srcpwd : ' + myPwd + logSeparator + 'API_URL: ' + LATTU__ADD_BALANCE + logSeparator + " accessToken: " + accessToken + logSeparator + "err: " + JSON.stringify(err);

        console.log('err : ', err)
        console.log('accessToken : ', accessToken)
        console.log('mySrc : ', mySrc);
        console.log('myPwd : ', myPwd);
        console.log('logText : ', logText);
        // return;

        if (err) {

            logText += 'AuthTokenGeneratorForLattu generate err: ' + JSON.stringify(err) + logSeparator;
            fmm.logWrite(logText, balanceLogFilePath);
            var response = new Response(err);
            res.send(response);

        }

        var payloadReqObj = {
            "srcuid": mySrc,
            "srcpwd": myPwd,
            "amount": req.params.amount,
            "usernameForBalanceAdd": req.params.usernameForBalanceAdd,
            "currencyCode": req.params.currencyCode,
            "channel": req.params.channel,
            "transactionRef": req.params.transactionRef,
            // "walletTypeId": walletTypeId
        };

        func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

            // console.log('resultPayload : ', resultPayload);

            logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

            request({
                method: 'post',
                url: LATTU__ADD_BALANCE,
                form: JSON.stringify({
                    'payload': resultPayload
                }),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken
                },
                json: true,
            }, function (err, httpResponse, body) {

                const apiResp = body;

                if (err) {

                    logText += 'LATTU_BALANCE_ADD response err: ' + err + logSeparator;
                    fmm.logWrite(logText, balanceLogFilePath);
                    var response = new Response(err);
                    res.send(response);

                } else {

                    logText += 'LATTU_BALANCE_ADD response: ' + JSON.stringify(apiResp) + logSeparator;
                    fmm.logWrite(logText, balanceLogFilePath);

                    var response = new Response(apiResp);
                    res.send(response);
                }

            });

        }, function (err) {

            // console.log('err ', err);
            logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
            var response = new Response(err);
            res.send(response);
            fmm.logWrite(logText, balanceLogFilePath);
        });


    });

    return next();
};

// Auth Token generate API. Params+Callback
function AuthTokenGeneratorForLattu(apiURL, cb) {

    const request = require('request');
    const jose = require('node-jose');
    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request

    jose.JWK.asKeyStore({
        "keys": [{
            "kty": "oct",
            "kid": EncryptionKeyId,
            "use": "enc",
            "alg": "A128CBC-HS256",
            "k": EncryptionKey
        }]
    }).then(result => {
        let key = result.get(EncryptionKeyId);
        jose.JWE.createEncrypt({
            format: 'compact',
            zip: true
        }, key).update(JSON.stringify({
            "clientId": clientId,
            "clientSecret": clientSecret,
            "grantType": grantType,
            "nonce": myNonce
        })).final().then(encPayload => {

            request({
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                url: apiURL,
                body: {
                    "payload": encPayload
                },
                json: true,
            }, function (err, httpResponse, body) {
                var apiResponse = body;

                if (apiResponse.status == 200) { // success response
                    var myRespData = apiResponse.data;
                    var accessToken = myRespData[0].access_token;
                    if (accessToken) {
                        cb(null, accessToken);
                    }
                } else {
                    cb(apiResponse, null);
                }
            });

        }).catch(err => {
            // throw err;
            cb(err, null);
        });
    });

};

Balance.prototype.tpBalanceCheck = function (req, res, next) {
    processBalanceCheck(req, res, next);
    return next();
};

Balance.prototype.tpBalanceAdd = function (req, res, next) {
    processBalanceAdd(req, res, next);
    return next();
};

Balance.prototype.lattuBalanceAdd = function (req, res, next) {
    processLattuBalanceAdd(req, res, next);
    return next();
};
