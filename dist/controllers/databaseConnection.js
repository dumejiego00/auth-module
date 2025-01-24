"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const isFreeDB = process.env.DB_ENV || false;
const dbConfigFreeDB = {
    host: process.env.DB_FREE_HOST,
    user: process.env.DB_FREE_USER,
    password: process.env.DB_FREE_PASSWORD,
    database: process.env.DB_FREE_DATABASE,
    multipleStatements: process.env.DB_FREE_MULTIPLE_STATEMENTS === "true",
    namedPlaceholders: process.env.DB_FREE_NAMED_PLACEHOLDERS === "true",
};
const dbConfigLocal = {
    host: process.env.DB_LOCAL_HOST,
    user: process.env.DB_LOCAL_USER,
    password: process.env.DB_LOCAL_PASSWORD,
    database: process.env.DB_LOCAL_DATABASE,
    multipleStatements: process.env.DB_LOCAL_MULTIPLE_STATEMENTS === "true",
    namedPlaceholders: process.env.DB_LOCAL_NAMED_PLACEHOLDERS === "true",
};
const database = promise_1.default.createPool(isFreeDB ? dbConfigFreeDB : dbConfigLocal);
exports.default = database;
