"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
exports.authorize = (...profiles) => {
    return (req, resp, next) => {
        if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
            console.log('req ', req.authenticated);
            next();
        }
        else {
            console.log('req ruim', req.authenticated);
            next(new restify_errors_1.ForbiddenError('Permission denied'));
        }
    };
};
