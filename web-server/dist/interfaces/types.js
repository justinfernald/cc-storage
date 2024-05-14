"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTypeServerToComputer = exports.MessageTypeComputerToServer = void 0;
var MessageTypeComputerToServer;
(function (MessageTypeComputerToServer) {
    MessageTypeComputerToServer["INVENTORY_UPDATE"] = "INVENTORY_UPDATE";
})(MessageTypeComputerToServer || (exports.MessageTypeComputerToServer = MessageTypeComputerToServer = {}));
var MessageTypeServerToComputer;
(function (MessageTypeServerToComputer) {
    MessageTypeServerToComputer["FETCH_UPDATE"] = "FETCH_UPDATE";
    MessageTypeServerToComputer["MOVE_ITEMS"] = "MOVE_ITEMS";
    MessageTypeServerToComputer["INFO"] = "INFO";
})(MessageTypeServerToComputer || (exports.MessageTypeServerToComputer = MessageTypeServerToComputer = {}));
