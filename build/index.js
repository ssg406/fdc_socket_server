"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const visible_logger_1 = require("visible_logger");
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
dotenv_1.default.config();
server_1.default.listen(3000);
logger.info(`Listening on port ${process.env.PORT}`, 'Server');
