// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.datapackLogFilePath = "./logs/DATAPACK_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Datapack = function () {
};

// routing
var datapack = new Datapack();


module.exports.route = function (app) {
    app.post(PATH + 'datapack_list', datapack.getDatapackList);
    app.post(PATH + 'datapack_list_with_amount', datapack.getInternetPackListWithAmount);
    app.post(PATH + 'datapack_list_amount', datapack.getInternetPackListWithAmount);
    app.post(PATH + 'datapack_check', datapack.datapackCheck);
    app.post(PATH + 'datapack_request', datapack.datapackRequest);
    app.post(PATH + 'datapack_status', datapack.datapackStatus);
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

function processDatapackStatus(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    // tid (string, optional) TID that was provided at the time of recharge request
    // customer_tid (string, optional) TID from customers which were sent with the payload while requesting transaction

    var payloadReqObj = {
        "tid": req.params.datapack_id,
        "customer_tid": req.params.customer_tid,
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
            url: DATAPACK_STATUS_API,
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
                logText += 'DATAPACK_STATUS_API err resp: ' + err + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'DATAPACK_STATUS_API resp: ' + JSON.stringify(apiResponse) + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);

                var response = new Response(apiResponse);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, datapackLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};

function processDatapackRequest(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    let walletTypeId = req.params.walletTypeId;
    if (func.inArray(walletTypeId, predefinedWalletTypeIds) === false) {
        logText += "DatapackRequest: walletTypeId mismatch.";
        fmm.logWrite(logText, topUpLogFilePath);

        res.send(new Response({
            "status": 500,
            "error": "walletTypeId mismatch."
        }));
    }

    var payloadReqObj = {
        "msisdn": req.params.msisdn,
        "datapack_id": req.params.datapack_id,
        "customer_tid": req.params.customer_tid,
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
            url: DATAPACK_REQUEST_API,
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
                logText += 'DATAPACK_RECHARGE_API err resp: ' + err + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'DATAPACK_RECHARGE_API resp: ' + JSON.stringify(apiResponse) + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);

                var response = new Response(apiResponse);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, datapackLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};

function processDatapackCheck(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "datapack_id": req.params.datapack_id,
        "customer_tid": req.params.customer_tid,
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
            url: DATAPACK_CHECK_API,
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

            if (err) {

                logText += 'DATAPACK_CHECK_API resp: ' + err + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                let myResponse = body;
                logText += 'DATAPACK_CHECK_API resp: ' + JSON.stringify(myResponse) + logSeparator;

                if (myResponse.status === 200) {
                    let custWalletObj = [];
                    let myWalletDetails = myResponse.data.walletDetails;

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
                            "name": myResponse.data.name,
                            "operator": myResponse.data.operator,
                            "country": myResponse.data.country,
                            "deductible_amount": myResponse.data.deductible_amount,
                            "walletDetails": custWalletObj
                        }
                    };

                    logText += 'custom_response: ' + JSON.stringify(myObj) + logSeparator;
                    fmm.logWrite(logText, datapackLogFilePath);
                    var response = new Response(myObj);
                    res.send(response);

                } else {

                    fmm.logWrite(logText, datapackLogFilePath);
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
        fmm.logWrite(logText, datapackLogFilePath);
    });

    return next();
};

function processDatapackList(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "country": req.params.country,
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
            url: DATAPACK_LIST_API,
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
                logText += 'DATAPACK_LIST_API resp: ' + JSON.stringify(err) + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'DATAPACK_LIST_API resp: ' + JSON.stringify(apiResponse) + logSeparator;
                fmm.logWrite(logText, datapackLogFilePath);

                var response = new Response(apiResponse);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, datapackLogFilePath);
        var response = new Response(err);
        res.send(response);
    });

    fmm.logWrite(logText, datapackLogFilePath);
    return next();
};

function processDatapackListWithAmount(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    var payloadReqObj = {
        "country": req.params.country,
        "srcuid": srcuid,
        "srcpwd": srcpwd,
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        request({
            method: 'post',
            url: DATAPACK_LIST_API,
            form: JSON.stringify({
                'payload': resultPayload,
            }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            var apiResponse = body;
            logText += 'DATAPACK_LIST_API resp: ' + JSON.stringify(apiResponse) + logSeparator + ' err: ' + err;

            if (apiResponse.status === 200) {

                let dataListArr = apiResponse.data;
                getProductShowData(dataListArr, function (productsObj, failed) {

                    logText += 'getProductShowData resp: ' + JSON.stringify(productsObj) + logSeparator + ' failed: ' + failed;
                    fmm.logWrite(logText, datapackLogFilePath);

                    if (failed) {
                        let response = new Response(failed);
                        res.send(response);
                    } else {
                        const finalResp = {status: 200, data: productsObj};
                        let response = new Response(finalResp);
                        res.send(response);
                    }

                });
            } else {

                logText += 'apiResponse failed resp: ' + JSON.stringify(apiResponse);
                fmm.logWrite(logText, datapackLogFilePath);

                let response = new Response(apiResponse);
                res.send(response);
            }
        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, datapackLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    fmm.logWrite(logText, datapackLogFilePath);
    return next();
};

function processProductShowAsDatapackList(req, res, next) {

    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request
    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator + 'nonce: ' + myNonce + logSeparator;

    let pUserId = PRODUCT_SHOW_USERID_LOCAL; // Staging
    if (IS_PRODUCTION === true) { // Production
        pUserId = PRODUCT_SHOW_USERID_LIVE;
    }

    const country = req.params.country;

    let countryCode;
    if (country.toUpperCase() === 'BANGLADESH') {
        countryCode = "88";
    } else if (country.toUpperCase() === 'NEPAL') {
        countryCode = "977";
    } else if (country.toUpperCase() === 'INDONESIA') {
        countryCode = "62";
    }

    const payloadReqObj = {
        "userId": pUserId,
        "addCommission": "yes",
        "nonce": myNonce, // optional, unique value to identify duplicate request
        "filters": {
            "categoryId": 2, // 2 is fixed for datapack
            "countryCode": countryCode
        },
        "srcuid": srcuid,
        "srcpwd": srcpwd
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        logText += "getEncryptedPayload CALLED " + 'err: ' + err + logSeparator + 'PAYLOAD: ' + resultPayload + logSeparator;

        request({
            method: 'post',
            url: TP_PRODUCT_SHOW,
            form: JSON.stringify({
                'payload': resultPayload,
            }),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            json: true,
        }, function (err, httpResponse, body) {

            // console.log('error:', err); // Print the error if one occurred
            // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

            let apiResponse = body;

            if (apiResponse.status === 200) {

                let apiData = apiResponse.data;
                let datapackArr = [];
                for (let i = 0; i < apiData.length; i++) {
                    let datapackObj = {};
                    datapackObj.id = apiData[i].productId;
                    datapackObj.name = apiData[i].productName;
                    datapackObj.description = apiData[i].productDescription;
                    datapackObj.operator = apiData[i].operator;
                    datapackObj.country = apiData[i].countryName;
                    datapackObj.deductible_amount = apiData[i].productSalesValueAfterCommission;
                    datapackArr.push(datapackObj);
                }

                logText += 'DatapackListWithAmountNewValues resp: ' + JSON.stringify(datapackArr);
                fmm.logWrite(logText, datapackLogFilePath);

                let customRespObj = {
                    status: apiResponse.status,
                    data: datapackArr
                };

                let response = new Response(customRespObj);
                res.send(response);

            } else {

                logText += 'DatapackListWithAmount resp: ' + apiResponse + logSeparator + ' err: ' + err;
                fmm.logWrite(logText, datapackLogFilePath);

                var response = new Response(apiResponse);
                res.send(response);
            }

        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, datapackLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};

Datapack.prototype.datapackStatus = function (req, res, next) {
    processDatapackStatus(req, res, next);
    return next();
};

Datapack.prototype.datapackRequest = function (req, res, next) {
    processDatapackRequest(req, res, next);
    return next();
};

Datapack.prototype.datapackCheck = function (req, res, next) {
    processDatapackCheck(req, res, next);
    return next();
};

Datapack.prototype.getDatapackList = function (req, res, next) {
    processDatapackList(req, res, next);
    return next();
};

Datapack.prototype.getDatapackListWithAmount = function (req, res, next) {
    processDatapackListWithAmount(req, res, next);
    return next();
};

Datapack.prototype.getInternetPackListWithAmount = function (req, res, next) {
    processProductShowAsDatapackList(req, res, next);
    return next();
};

function getProductShowData(datapackListArr, cb) {

    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request

    let pUserId = PRODUCT_SHOW_USERID_LOCAL; // Staging
    if (IS_PRODUCTION === true) { // Production
        pUserId = PRODUCT_SHOW_USERID_LIVE;
    }

    const payloadReqObj = {
        "userId": pUserId, // req.params.userId,
        "addCommission": "yes", // values('yes'/'no')
        "nonce": myNonce, // optional, unique value to identify duplicate request
        "filters": {
            "categoryId": 2, // fixed for datapack
            "countryCode": "88"
        },
        "srcuid": srcuid,
        "srcpwd": srcpwd
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        request({
            method: 'post',
            url: TP_PRODUCT_SHOW,
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

            if (apiResp.status === 200) {

                let productShowData = apiResp.data;
                let products = productShowData.length;
                let productListArr = [];

                for (let e = 0; e < productShowData.length; e++) {
                    let productLists = {};
                    productLists.id = productShowData[e].productId;
                    productLists.deductible_amount = productShowData[e].productSalesValueAfterCommission;
                    productListArr.push(productLists);

                }

                let mergedArr = [datapackListArr, productListArr].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
                //  console.log('mergedArr ', mergedArr);
                cb(mergedArr, null);

            } else {

                cb(null, apiResp);
            }
        });

    }, function (err) {

        cb(null, err);
    });
}