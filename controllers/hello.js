// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.operatorLogFilePath = "./logs/OPERATOR_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Operator = function () {
};

// routing
var operator = new Operator();

module.exports.route = function (app) {
    app.get(PATH + 'hello', operator.tpOperatorIdentify);
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


Operator.prototype.tpOperatorIdentify = function (req, res, next) {
    console.log('Hello Test !!');
    return next();
};
