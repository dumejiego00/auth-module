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
Object.defineProperty(exports, "__esModule", { value: true });
const databaseTestConnection_1 = require("./controllers/databaseTestConnection");
const databaseAccessLayer_1 = require("./controllers/databaseAccessLayer");
describe('checkIfUsernameExist', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should not throw an error if username does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, databaseAccessLayer_1.checkIfUsernameExist)('newuser', connection)).resolves.not.toThrow();
        const [result] = yield connection.query('SELECT * FROM users WHERE username = :username', { username: 'newuser' });
        expect(result.length).toBe(0);
    }));
    it('should throw an error if username already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
            username: 'existinguser',
            email: 'existinguser@example.com',
            password: 'hashedpassword',
        });
        yield expect((0, databaseAccessLayer_1.checkIfUsernameExist)('existinguser', connection)).rejects.toThrow('Username is already in use by a different user');
        const [result] = yield connection.query('SELECT * FROM users WHERE username = :username', { username: 'existinguser' });
        expect(result.length).toBe(1);
    }));
});
describe('checkIfEmailExist', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should not throw an error if email does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, databaseAccessLayer_1.checkIfEmailExist)('newemail@example.com', connection)).resolves.not.toThrow();
        const [result] = yield connection.query('SELECT * FROM users WHERE email = :email', { email: 'newemail@example.com' });
        expect(result.length).toBe(0);
    }));
    it('should throw an error if email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
            username: 'testuser',
            email: 'existingemail@example.com',
            password: 'hashedpassword',
        });
        yield expect((0, databaseAccessLayer_1.checkIfEmailExist)('existingemail@example.com', connection)).rejects.toThrow('Email is already in use by a different user');
        const [result] = yield connection.query('SELECT * FROM users WHERE email = :email', { email: 'existingemail@example.com' });
        expect(result.length).toBe(1);
    }));
});
describe('createUser', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should create a new user when username and email are unique', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield (0, databaseAccessLayer_1.createUser)('newuser', 'newuser@example.com', 'password123', connection);
        expect(user).toHaveProperty('id');
        expect(user.username).toBe('newuser');
        expect(user.email).toBe('newuser@example.com');
        const [result] = yield connection.query('SELECT * FROM users WHERE username = :username', { username: 'newuser' });
        expect(result.length).toBe(1);
        expect(result[0].username).toBe('newuser');
    }));
    it('should throw an error if the username already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
            username: 'existinguser',
            email: 'existinguser@example.com',
            password: 'hashedpassword',
        });
        yield expect((0, databaseAccessLayer_1.createUser)('existinguser', 'another@example.com', 'password123', connection))
            .rejects.toThrow('Username is already in use by a different user');
    }));
    it('should throw an error if the email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
            username: 'user1',
            email: 'existingemail@example.com',
            password: 'hashedpassword',
        });
        yield expect((0, databaseAccessLayer_1.createUser)('newuser', 'existingemail@example.com', 'password123', connection))
            .rejects.toThrow('Email is already in use by a different user');
    }));
    it('should throw an error if the email format is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, databaseAccessLayer_1.createUser)('newuser', 'invalid-email', 'password123', connection))
            .rejects.toThrow('Invalid email format');
    }));
});
describe('getUserByEmail', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should return null if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield (0, databaseAccessLayer_1.getUserByEmail)('nonexistent@example.com', connection);
        expect(user).toBeNull();
    }));
    it('should return the user if the email exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'existing@example.com';
        yield connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', { username: 'testuser', email, password: 'hashedpassword' });
        const user = yield (0, databaseAccessLayer_1.getUserByEmail)(email, connection);
        expect(user).not.toBeNull();
        expect(user === null || user === void 0 ? void 0 : user.email).toBe(email);
        expect(user === null || user === void 0 ? void 0 : user.username).toBe('testuser');
    }));
});
describe('getUserById', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should return the user if the userId exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (email, username, password, is_verified, is_admin) VALUES (:email, :username, :password, :is_verified, :is_admin)', {
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashedpassword',
            is_verified: true,
            is_admin: false,
        });
        const [rows] = yield connection.query('SELECT * FROM users WHERE username = :username', {
            username: 'testuser',
        });
        const userId = rows[0].id;
        const user = yield (0, databaseAccessLayer_1.getUserById)(userId, connection);
        expect(user).not.toBeNull();
        expect(user === null || user === void 0 ? void 0 : user.id).toBe(userId);
        expect(user === null || user === void 0 ? void 0 : user.username).toBe('testuser');
    }));
    it('should return null if the userId does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistingUserId = 99999;
        const user = yield (0, databaseAccessLayer_1.getUserById)(nonExistingUserId, connection);
        expect(user).toBeNull();
    }));
});
describe('getUserByUsername', () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it('should return the user if the username exists', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query('INSERT INTO users (email, username, password, is_verified, is_admin) VALUES (:email, :username, :password, :is_verified, :is_admin)', {
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashedpassword',
            is_verified: true,
            is_admin: false,
        });
        const user = yield (0, databaseAccessLayer_1.getUserByUsername)('testuser', connection);
        expect(user).not.toBeNull();
        expect(user === null || user === void 0 ? void 0 : user.username).toBe('testuser');
        expect(user === null || user === void 0 ? void 0 : user.email).toBe('test@example.com');
    }));
    it('should return null if the username does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistingUsername = 'nonexistinguser';
        const user = yield (0, databaseAccessLayer_1.getUserByUsername)(nonExistingUsername, connection);
        console.log("what was returned", user);
        expect(user).toBeNull();
    }));
});
describe("verifyUser", () => {
    let connection;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        connection = yield (0, databaseTestConnection_1.getTestConnection)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.closeTestConnection)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, databaseTestConnection_1.resetTestDatabase)();
    }));
    it("should verify a user when the user exists", () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.query(`INSERT INTO users (email, username, password, is_verified, is_admin, created_at)
       VALUES (:email, :username, :password, :is_verified, :is_admin, NOW())`, {
            email: "testuser@example.com",
            username: "testuser",
            password: "hashedpassword",
            is_verified: false,
            is_admin: false,
        });
        const [rows] = yield connection.query("SELECT id FROM users WHERE username = :username", { username: "testuser" });
        const userId = rows[0].id;
        const verifiedUser = yield (0, databaseAccessLayer_1.verifyUser)(userId, connection);
        expect(verifiedUser).not.toBeNull();
        expect(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.id).toBe(userId);
        expect(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.is_verified).toBe(1);
        const [updatedUser] = yield connection.query("SELECT * FROM users WHERE id = :id", { id: userId });
        expect(updatedUser[0].is_verified).toBe(1);
    }));
    it("should return null if the user does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistingUserId = 99999;
        const result = yield (0, databaseAccessLayer_1.verifyUser)(nonExistingUserId, connection);
        expect(result).toBeNull();
    }));
});
