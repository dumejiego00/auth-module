"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTestDatabase = exports.closeTestConnection = exports.getTestConnection = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = require("mysql2/promise");
dotenv_1.default.config();
let connection = null;
const getTestConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!connection) {
        connection = yield (0, promise_1.createConnection)({
            host: process.env.DB_LOCAL_HOST,
            user: process.env.DB_LOCAL_USER,
            password: process.env.DB_LOCAL_PASSWORD,
            database: process.env.DB_LOCAL_TEST_DATABASE,
            multipleStatements: process.env.DB_LOCAL_MULTIPLE_STATEMENTS === "true",
            namedPlaceholders: process.env.DB_LOCAL_NAMED_PLACEHOLDERS === "true",
        });
    }
    return connection;
});
exports.getTestConnection = getTestConnection;
const closeTestConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (connection) {
        yield connection.end();
        connection = null;
    }
});
exports.closeTestConnection = closeTestConnection;
const resetTestDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (connection) {
        yield connection.query('TRUNCATE TABLE users');
    }
});
exports.resetTestDatabase = resetTestDatabase;
