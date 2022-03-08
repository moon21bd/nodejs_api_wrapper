// libraries
var request = require('request');
var dt = require('../modules/currentDateTimeModule');
var fmm = require('../modules/fileManagerModule');
var func = require('../modules/func');

global.supportLogFilePath = "./logs/SUPPORT_LOGS_" + dt.getDateTime() + ".txt";

// class declaration
var Support = function () {
};

// routing
var support = new Support();

module.exports.route = function (app) {
    app.post(PATH + 'support_ticket_create', support.supportTicketsCreate);
    app.post(PATH + 'support_ticket_status', support.supportCheckTicketsStatus);
    app.post(PATH + 'get_support_tickets', support.getSupportTickets);
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

function processSupportCheckTicketStatus(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;

    func.SupportAuthTokenGenerator(SUPPORT_TOKEN_REQUEST, function (accessTokenErr, accessToken) {

        // console.log('accessToken ', accessToken);
        logText += 'SupportAuthTokenGenerator CALLED: ' + accessToken + logSeparator;

        var reqURL = SUPPORT_TICKETS_STATUS_BASE + req.params.ticket_id + "/status";
        logText += 'reqURL: ' + reqURL + logSeparator;

        const options = {
            url: reqURL,
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            json: true
        };

        request(options, function (err, httpResponse, body) {

            if (err) {
                logText += 'SUPPORT_TICKETS_STATUS callback err: ' + err + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(err);
                res.send(response);

            } else {

                var resp = body;
                logText += 'SUPPORT_TICKETS_STATUS response: ' + resp + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(resp);
                res.send(response);
            }

        });


    }, function (tokenErr) {

        // console.log('tokenErr ', tokenErr);
        logText += 'tokenErr callback err: ' + tokenErr + logSeparator;
        fmm.logWrite(logText, supportLogFilePath);

        var response = new Response(tokenErr);
        res.send(response);
    });

    return next();
};

function processSupportTicketsCreate(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;
    func.SupportAuthTokenGenerator(SUPPORT_TOKEN_REQUEST, function (accessTokenErr, accessToken) {

        logText += 'SupportAuthTokenGenerator CALLED: ' + accessToken + logSeparator;

        let postData = {
            "title": req.params.title,
            "body": req.params.body,
            "service_id": req.params.service_id,
            "customer_id": req.params.customer_id,
            "create_user_if_not_found": true
        };

        request({
            method: 'post',
            url: SUPPORT_TICKETS_CREATE,
            json: postData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            // json: true,
        }, function (err, httpResponse, body) {

            // console.log('error:', err); // Print the error if one occurred
            // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

            var apiResponse = body;
            // console.log('apiResponse succ ', apiResponse);

            if (err) {
                logText += 'SUPPORT_TICKETS_CREATE Callback err: ' + err + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(err);
                res.send(response);

            } else {
                var resp = apiResponse;

                logText += 'SUPPORT_TICKETS_CREATE Response: ' + JSON.stringify(resp) + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(resp);
                res.send(response);
            }

        });

    }, function (tokenErr) {

        // console.log('tokenErr ', tokenErr);
        logText += 'tokenErr callback err: ' + tokenErr + logSeparator;
        fmm.logWrite(logText, supportLogFilePath);

        var response = new Response(tokenErr);
        res.send(response);
    });

    return next();
};

function processGetSupportTickets(req, res, next) {

    logText = 'dt ' + dt.getDateTimeFormatted() + logSeparator + JSON.stringify(req.params) + logSeparator;
    func.SupportAuthTokenGenerator(SUPPORT_TOKEN_REQUEST, function (accessTokenErr, accessToken) {

        logText += 'SupportAuthTokenGenerator CALLED: ' + accessToken + logSeparator;

        let postData = {
            "customer_id": req.params.customer_id,
            "service_id": req.params.service_id,
            "start": req.params.start,
            "end": req.params.end,

            // "from": req.params.from,
            // "to": req.params.to,
            // "sort_by": req.params.sort_by,
            // "sort_order": req.params.sort_order
        };

        request({
            method: 'post',
            url: SUPPORT_TICKETS_API,
            json: postData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            // json: true,
        }, function (err, httpResponse, body) {

            // console.log('error:', err); // Print the error if one occurred
            // console.log('statusCode:', httpResponse); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.

            var apiResponse = body;
            // console.log('apiResponse succ ', apiResponse);

            if (err) {
                logText += 'SUPPORT_TICKETS_API Callback err: ' + err + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(err);
                res.send(response);

            } else {
                var resp = apiResponse;

                logText += 'SUPPORT_TICKETS_API Response: ' + JSON.stringify(resp) + logSeparator;
                fmm.logWrite(logText, supportLogFilePath);

                var response = new Response(resp);
                res.send(response);
            }

        });

    }, function (tokenErr) {

        // console.log('tokenErr ', tokenErr);
        logText += 'tokenErr callback err: ' + tokenErr + logSeparator;
        fmm.logWrite(logText, supportLogFilePath);

        var response = new Response(tokenErr);
        res.send(response);
    });

    return next();
};

Support.prototype.supportCheckTicketsStatus = function (req, res, next) {
    processSupportCheckTicketStatus(req, res, next);
    return next();
};

Support.prototype.supportTicketsCreate = function (req, res, next) {
    processSupportTicketsCreate(req, res, next);
    return next();
};

Support.prototype.getSupportTickets = function (req, res, next) {
    processGetSupportTickets(req, res, next);
    return next();
};