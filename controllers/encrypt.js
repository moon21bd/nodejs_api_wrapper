// libraries
var Encryption = require('../models/encrypt');
var func = require('../modules/func');

// class declaration
var Encrypt = function () {
};

// routing
var encrypt = new Encrypt();

module.exports.route = function (app) {

    app.post(PATH + 'encrypt', encrypt.encryption);
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


function processEncryptKey(req, res, next) {

    var payloadReqObj = {
        "msisdn": req.params.msisdn,
        "amount": req.params.amount,
        "operator": req.params.operator,
        "type": req.params.type,
        "customer_tid": req.params.customer_tid,
        "srcuid": srcuid,
        "srcpwd": srcpwd,
    };

    func.getEncryptedPayload(payloadReqObj, function (err, resultPayload) {

        var responseBuilder = new ResponseBuilder();
        if (resultPayload) {
            responseBuilder.setSuccessMsg("Encrypted payload");
            responseBuilder.setData({
                'payload': resultPayload
            });
        } else {
            responseBuilder.setErrorMsg("Payload encryption failed!");
        }

        var response = new Response(responseBuilder);
        res.send(response);

    }, function (err) {

        responseBuilder.setErrorMsg("Payload encryption failed!");
        responseBuilder.setData({
            'message': err
        });
    });

    return next();
};

Encrypt.prototype.encryption = function (req, res, next) {

    processEncryptKey(req, res, next);
    return next();
};

/*function getEncryptedPayload(params, callback) {

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

}*/
