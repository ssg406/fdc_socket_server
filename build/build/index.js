"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const visible_logger_1 = __importDefault(require("visible_logger"));
const error = new Error('this is an error');
visible_logger_1.default.error('I am logging an error', error, 'Error cat');
visible_logger_1.default.info('This is an info log', 'INFO');
visible_logger_1.default.log('This is a regular log', 'Reg Cat');
visible_logger_1.default.log('Log with no category');
visible_logger_1.default.success('success log', 'Success Cat');
visible_logger_1.default.warn('A warning log', 'WARNING');
