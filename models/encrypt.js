// libraries
// var util = require('util');
// var Model = require('./base');

var Encryption = function () {
};

Encryption.prototype.doEncrypt = function (params, success, fail) {

    getEncryptedPayload(params, function (err, result) {
        console.log('MyResult ', result);
    }, function (err) {
        console.log('err ', err);
    });

}

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
            "kid": "5bd485f0-09a1-11e9-aea3-1f560374ecce",
            "use": "enc",
            "alg": "A128CBC-HS256",
            "k": "Ld83ShdoDVVmdXFCrRB8N8c6tkLKttmtxM_9MmZpfos"
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
        let key = result.get(keyId);
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

module.exports = Encryption;
