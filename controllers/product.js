// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.productLogFilePath = "./logs/PRODUCT_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Product = function () {
};

// routing
var product = new Product();

module.exports.route = function (app) {
    app.post(PATH + 'product_show', product.productShow);
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

function processProductShow(req, res, next) {

    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request
    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator + 'nonce: ' + myNonce + logSeparator;

    var pUserId = PRODUCT_SHOW_USERID_LOCAL; // Staging
    if (IS_PRODUCTION === true) { // Production
        pUserId = PRODUCT_SHOW_USERID_LIVE;
    }

    var payloadReqObj = {
        "userId": pUserId, // req.params.userId,
        "addCommission": req.params.addCommission, // values('yes'/'no')
        "nonce": myNonce, // optional, unique value to identify duplicate request
        "filters": req.params.filters, // object, required {"categoryId": "1","countryCode": "88"},
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

                logText += 'TP_PRODUCT_SHOW err resp: ' + err + logSeparator;
                fmm.logWrite(logText, productLogFilePath);
                var response = new Response(err);
                res.send(response);

            } else {

                logText += 'TP_PRODUCT_SHOW resp: ' + JSON.stringify(apiResponse);
                fmm.logWrite(logText, productLogFilePath);
                var response = new Response(apiResponse);
                res.send(response);
            }
        });

    }, function (err) {

        // console.log('err ', err);
        logText += 'getEncryptedPayload callback err: ' + err + logSeparator;
        fmm.logWrite(logText, productLogFilePath);

        var response = new Response(err);
        res.send(response);
    });

    return next();
};

Product.prototype.productShow = function (req, res, next) {

    processProductShow(req, res, next);
    return next();
};