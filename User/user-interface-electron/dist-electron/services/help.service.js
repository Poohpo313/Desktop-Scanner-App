"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpService = void 0;
const api_service_1 = require("./api.service");
exports.helpService = {
    submitConcern(payload) {
        return (0, api_service_1.submitUserConcern)(payload);
    },
    listTickets(userId) {
        return (0, api_service_1.listUserConcerns)(userId);
    },
    markReplyRead(concernId) {
        return (0, api_service_1.markUserConcernReplyRead)(concernId);
    },
};
