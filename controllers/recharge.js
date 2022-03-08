// libraries
var request = require('request');

// class declaration
var Recharge = function () {
};

// routing
var recharge = new Recharge();

module.exports.route = function (app) {

    app.post(PATH + 'bd_recharge_api', recharge.bdRechargeApi); // /api/bd-recharge-api
    // app.get('/city/:id', news.getCity);
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


function processBdRechargeApi(req, res, next) {

    var msisdn = req.params.msisdn;
    var amount = req.params.amount;
    var operator = req.params.operator;
    var type = req.params.type;
    var customer_tid = req.params.customer_tid;

    var responseBuilder = new ResponseBuilder();
    getEncryptedPayload(req.params, function (err, resultPayload) {

        console.log('resultPayload ', resultPayload);

        var reqObj = {
            'payload': resultPayload,
        };

        console.log('reqObj ', JSON.stringify(reqObj));

        // Custom Header pass
        var headersOpt = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        request({
            method: 'post',
            url: BD_RECHARGE_API,
            form: JSON.stringify(reqObj),
            headers: headersOpt,
            json: true,
        }, function (err, httpResponse, body) {

            // Print the Response
            console.log(body);

            var apiResponse = body;

            var response = new Response(apiResponse);
            res.send(response);

            // console.log('error:', err); // Print the error if one occurred
            // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

        });

    }, function (err) {
        console.log(err);
        /*responseBuilder.setErrorMsg("Payload encryption failed!");
        responseBuilder.setData({
            'message': err
        });*/
    });

    return next();
};

function getEncryptedPayload(params, callback) {

    const jose = require('node-jose');

    var msisdn = params.msisdn;
    var amount = params.amount;
    var operator = params.operator;
    var type = params.type;
    var customer_tid = params.customer_tid;

    const keystore = {
        "keys": [{
            "kty": "oct",
            "kid": EncryptionKeyId,
            "use": "enc",
            "alg": "A128CBC-HS256",
            "k": EncryptionKey
        }]
    };

    const payload = {
        "msisdn": msisdn, // "8801900000000",
        "amount": amount, // "20",
        "srcuid": srcuid, // 'test';
        "srcpwd": srcpwd, // 'test';
        "operator": operator, // "Banglalink",
        "type": type, // "PREPAID",
        "customer_tid": customer_tid, // "12345678"
    };

    jose.JWK.asKeyStore(keystore).then(result => {
        let key = result.get(EncryptionKeyId);
        jose.JWE.createEncrypt({
            format: 'compact',
            zip: true
        }, key).update(JSON.stringify(payload)).final().then(result => {
            callback(null, result);
        }).catch(err => {
            throw err;
        });
    });

}

Recharge.prototype.bdRechargeApi = function (req, res, next) {

    processBdRechargeApi(req, res, next);
    return next();
};