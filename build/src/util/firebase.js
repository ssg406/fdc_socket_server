"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const visible_logger_1 = require("visible_logger");
//For local devlopment
const dotenv_1 = __importDefault(require("dotenv"));
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
let key;
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') {
    dotenv_1.default.config();
    key = process.env.FIREBASE_PRIVATE_KEY;
}
else {
    const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
    key = privateKey;
}
// Initialize Firebase admin
(0, app_1.initializeApp)({
    credential: firebase_admin_1.default.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: key,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
});
const db = firebase_admin_1.default.firestore();
logger.info('Database initialized', 'Firestore');
exports.default = db;
