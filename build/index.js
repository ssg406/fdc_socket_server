"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const visible_logger_1 = require("visible_logger");
const server_1 = __importDefault(require("./server"));
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
    dotenv_1.default.config();
}
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
const port = parseInt(process.env.PORT) || 3000;
server_1.default.listen(port);
logger.info(`Server is listening on port ${port}`, 'Server');
