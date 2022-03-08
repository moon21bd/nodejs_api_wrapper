// Checks value in array
module.exports.inArray = function (needle, haystack) {

    let length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
};

// Encrypted Payload value generator. Callback
exports.getEncryptedPayload = function (payloadReqObj, callback) {

    const jose = require('node-jose');
    const keystore = {
        "keys": [{
            "kty": "oct",
            "kid": EncryptionKeyId,
            "use": "enc",
            "alg": "A128CBC-HS256",
            "k": EncryptionKey
        }]
    };

    jose.JWK.asKeyStore(keystore).then(result => {
        let key = result.get(EncryptionKeyId);
        jose.JWE.createEncrypt({
            format: 'compact',
            zip: true
        }, key).update(JSON.stringify(payloadReqObj)).final().then(result => {
            callback(null, result);
        }).catch(err => {
            // throw err;
            callback(err, null);
        });
    });

}

// Auth Token generate API. Params+Callback
exports.AuthTokenGenerator = function (apiURL, callback) {

    const request = require('request');
    const jose = require('node-jose');
    const myNonce = Math.random().toString(36).slice(2); // unique nonce for each request

    var reqObj = {
        "clientId": clientId,
        "clientSecret": clientSecret,
        "grantType": grantType,
        "nonce": myNonce
    };

    const keystore = {
        "keys": [{
            "kty": "oct",
            "kid": EncryptionKeyId,
            "use": "enc",
            "alg": "A128CBC-HS256",
            "k": EncryptionKey
        }]
    };

    jose.JWK.asKeyStore(keystore).then(result => {
        let key = result.get(EncryptionKeyId);
        jose.JWE.createEncrypt({
            format: 'compact',
            zip: true
        }, key).update(JSON.stringify(reqObj)).final().then(encPayload => {

            var payloadObj = {
                "payload": encPayload
            };

            request({
                method: 'post',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                url: apiURL,
                body: payloadObj,
                json: true,
            }, function (err, httpResponse, body) {
                var apiResponse = body;

                // console.log('auth body ', payloadObj);
                // console.log('auth apiResponse ', apiResponse);

                if (apiResponse.status === 200) { // success response
                    var myRespData = apiResponse.data;
                    callback(null, myRespData[0].access_token);
                } else {
                    callback(apiResponse, null);
                }

            });

        }).catch(err => {
            // throw err;
            callback(err, null);
        });
    });

}

// Auth Token generate API. Params+Callback
exports.SupportAuthTokenGenerator = function (apiURL, callback) {

    var request = require('request');

    let postParams = {
        "grant_type": supportGrantType,
        "client_id": supportClientId,
        "client_secret": supportClientSecret,
        "username": supportUsername,
        "password": supportPassword,
        "scope": "api"
    };

    request({
        method: 'post',
        url: apiURL,
        json: postParams,
        headers: {
            "Content-Type": "application/json"
        },
    }, function (err, httpResponse, body) {

        // console.log('error:', err); // Print the error if one occurred
        // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.

        if (err) {
            callback(err, null);
        } else {
            var resp = body;
            callback(null, resp.access_token);
        }
    });

};
