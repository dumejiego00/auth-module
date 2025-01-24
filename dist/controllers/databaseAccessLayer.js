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
exports.getConnection = getConnection;
exports.getUserById = getUserById;
exports.getUserByUsername = getUserByUsername;
exports.getUserByEmail = getUserByEmail;
exports.checkIfUsernameExist = checkIfUsernameExist;
exports.checkIfEmailExist = checkIfEmailExist;
exports.createUser = createUser;
exports.verifyUser = verifyUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const databaseConnection_1 = __importDefault(require("./databaseConnection"));
function getConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield databaseConnection_1.default.getConnection();
        return connection;
    });
}
function getUserById(userId, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE id = :userId;
  `;
        try {
            const [results] = yield connection.query(sqlQuery, { userId });
            if (results.length === 0)
                return null;
            const user = results[0];
            return user;
        }
        catch (err) {
            console.error("Error fetching user by ID:", err);
            return null;
        }
    });
}
function getUserByUsername(username, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin
    FROM users
    WHERE username = :username;
  `;
        try {
            const [results] = yield connection.query(sqlQuery, { username });
            if (results.length === 0) {
                return null; // Explicitly return null when no user is found
            }
            return results[0];
        }
        catch (err) {
            console.error("Error fetching user by username:", err);
            return null;
        }
    });
}
function getUserByEmail(email, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlQuery = `
    SELECT id, username, email, password, is_verified, is_admin
    FROM users
    WHERE email = :email;
  `;
        try {
            const [results] = yield connection.query(sqlQuery, { email });
            if (results.length === 0)
                return null;
            const user = results[0];
            return user;
        }
        catch (err) {
            console.error("Error fetching user by email:", err);
            return null;
        }
    });
}
function checkIfUsernameExist(username, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [existingUsername] = yield connection.query('SELECT * FROM users WHERE username = :username', { username });
            if (existingUsername.length > 0) {
                throw new Error('Username is already in use by a different user');
            }
        }
        catch (err) {
            console.error("Error checking if username exists:", err);
            throw err;
        }
    });
}
function checkIfEmailExist(email, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [existingEmail] = yield connection.query('SELECT * FROM users WHERE email = :email', { email });
            if (existingEmail.length > 0) {
                throw new Error('Email is already in use by a different user');
            }
        }
        catch (err) {
            console.error('Error checking if email exists:', err);
            throw err;
        }
    });
}
function createUser(username, email, password, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!validator_1.default.isEmail(email)) {
                throw new Error('Invalid email format');
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield checkIfUsernameExist(username, connection);
            yield checkIfEmailExist(email, connection);
            const [result] = yield connection.query(`
        INSERT INTO users (username, email, password)
        VALUES (:username, :email, :password)
      `, { username, email, password: hashedPassword });
            return { id: result.insertId, username, email };
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    });
}
function verifyUser(userId, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlQuery = `
    UPDATE users
    SET is_verified = true
    WHERE id = :userId;
  `;
        try {
            const [result] = yield connection.query(sqlQuery, { userId });
            if (result.affectedRows === 0) {
                console.log("No user found with the specified ID to verify.");
                return null;
            }
            const [updatedUser] = yield connection.query(`
      SELECT id, email, username, is_verified, is_admin, created_at
      FROM users
      WHERE id = :userId;
      `, { userId });
            return updatedUser[0] || null;
        }
        catch (err) {
            console.error("Error verifying user:", err);
            throw err;
        }
    });
}
