/**
 * news model
 */

var util = require('util');
var Model = require('./base');

var AuthModel = function() {};
util.inherits(AuthModel, Model);

AuthModel.prototype.checkApiKey = function(countryName, apiKey, success, fail) {
    var self = this;
    self.init([], success, fail);
    var db = self.db(countryName);
    var logger = self.logger();

    var sql = "SELECT api_key FROM app_information WHERE api_key = " + apiKey;

    db.query(sql, function(err, result) {
        if (err) {
            self.queryError.bind(self);
            throw err;
        }

        self.queryEnd.bind(this);

        if (result.length > 0) {
            self.setResult(result);
            self.resultEnd(this);
        } else {
            var error = {
                code: 404,
                message: "api key not matched"
            };
            self.resultError(error).bind(this);
        }
    });

    db.end();
}

module.exports = AuthModel;
