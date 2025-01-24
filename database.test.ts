import { Connection, RowDataPacket } from 'mysql2/promise';
import { getTestConnection, closeTestConnection, resetTestDatabase } from './controllers/databaseTestConnection';
import { checkIfUsernameExist, checkIfEmailExist, createUser, getUserByEmail, getUserById, getUserByUsername, verifyUser } from './controllers/databaseAccessLayer';

describe('checkIfUsernameExist', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should not throw an error if username does not exist', async () => {
    await expect(checkIfUsernameExist('newuser', connection)).resolves.not.toThrow();

    const [result] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = :username',
      { username: 'newuser' }
    );

    expect(result.length).toBe(0);
  });

  it('should throw an error if username already exists', async () => {
    await connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
      username: 'existinguser',
      email: 'existinguser@example.com',
      password: 'hashedpassword',
    });

    await expect(checkIfUsernameExist('existinguser', connection)).rejects.toThrow('Username is already in use by a different user');

    const [result] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = :username',
      { username: 'existinguser' }
    );

    expect(result.length).toBe(1);
  });
});

describe('checkIfEmailExist', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should not throw an error if email does not exist', async () => {
    await expect(checkIfEmailExist('newemail@example.com', connection)).resolves.not.toThrow();

    const [result] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = :email',
      { email: 'newemail@example.com' }
    );

    expect(result.length).toBe(0);
  });

  it('should throw an error if email already exists', async () => {
    await connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
      username: 'testuser',
      email: 'existingemail@example.com',
      password: 'hashedpassword',
    });

    await expect(checkIfEmailExist('existingemail@example.com', connection)).rejects.toThrow('Email is already in use by a different user');

    const [result] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = :email',
      { email: 'existingemail@example.com' }
    );

    expect(result.length).toBe(1);
  });
});

describe('createUser', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should create a new user when username and email are unique', async () => {
    const user = await createUser('newuser', 'newuser@example.com', 'password123', connection);
    
    expect(user).toHaveProperty('id');
    expect(user.username).toBe('newuser');
    expect(user.email).toBe('newuser@example.com');

    const [result] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = :username',
      { username: 'newuser' }
    );

    expect(result.length).toBe(1);
    expect(result[0].username).toBe('newuser');
  });

  it('should throw an error if the username already exists', async () => {
    await connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
      username: 'existinguser',
      email: 'existinguser@example.com',
      password: 'hashedpassword',
    });

    await expect(createUser('existinguser', 'another@example.com', 'password123', connection))
      .rejects.toThrow('Username is already in use by a different user');
  });

  it('should throw an error if the email already exists', async () => {
    await connection.query('INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', {
      username: 'user1',
      email: 'existingemail@example.com',
      password: 'hashedpassword',
    });

    await expect(createUser('newuser', 'existingemail@example.com', 'password123', connection))
      .rejects.toThrow('Email is already in use by a different user');
  });

  it('should throw an error if the email format is invalid', async () => {
    await expect(createUser('newuser', 'invalid-email', 'password123', connection))
      .rejects.toThrow('Invalid email format');
  });
});

describe('getUserByEmail', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should return null if user does not exist', async () => {
    const user = await getUserByEmail('nonexistent@example.com', connection);
    expect(user).toBeNull();
  });

  it('should return the user if the email exists', async () => {
    const email = 'existing@example.com';
    await connection.query(
      'INSERT INTO users (username, email, password) VALUES (:username, :email, :password)', 
      { username: 'testuser', email, password: 'hashedpassword' }
    );

    const user = await getUserByEmail(email, connection);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(email);
    expect(user?.username).toBe('testuser');
  });
});

describe('getUserById', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should return the user if the userId exists', async () => {
    await connection.query(
      'INSERT INTO users (email, username, password, is_verified, is_admin) VALUES (:email, :username, :password, :is_verified, :is_admin)',
      {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        is_verified: true,
        is_admin: false,
      }
    );

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE username = :username', {
      username: 'testuser',
    });
    const userId = rows[0].id;

    const user = await getUserById(userId, connection);

    expect(user).not.toBeNull();
    expect(user?.id).toBe(userId);
    expect(user?.username).toBe('testuser');
  });

  it('should return null if the userId does not exist', async () => {
    const nonExistingUserId = 99999;

    const user = await getUserById(nonExistingUserId, connection);

    expect(user).toBeNull();
  });
});

describe('getUserByUsername', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should return the user if the username exists', async () => {
    await connection.query(
      'INSERT INTO users (email, username, password, is_verified, is_admin) VALUES (:email, :username, :password, :is_verified, :is_admin)',
      {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        is_verified: true,
        is_admin: false,
      }
    );

    const user = await getUserByUsername('testuser', connection);

    expect(user).not.toBeNull();
    expect(user?.username).toBe('testuser');
    expect(user?.email).toBe('test@example.com');
  });

  it('should return null if the username does not exist', async () => {
    const nonExistingUsername = 'nonexistinguser';

    const user = await getUserByUsername(nonExistingUsername, connection);
    console.log("what was returned", user)

    expect(user).toBeNull();
  });
});

describe("verifyUser", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await resetTestDatabase
  });

  it("should verify a user when the user exists", async () => {
    await connection.query(
      `INSERT INTO users (email, username, password, is_verified, is_admin, created_at)
       VALUES (:email, :username, :password, :is_verified, :is_admin, NOW())`,
      {
        email: "testuser@example.com",
        username: "testuser",
        password: "hashedpassword",
        is_verified: false,
        is_admin: false,
      }
    );

    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = :username",
      { username: "testuser" }
    );
    const userId = rows[0].id;

    const verifiedUser = await verifyUser(userId, connection);

    expect(verifiedUser).not.toBeNull();
    expect(verifiedUser?.id).toBe(userId);
    expect(verifiedUser?.is_verified).toBe(1);

    const [updatedUser] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = :id",
      { id: userId }
    );
    expect(updatedUser[0].is_verified).toBe(1);
  });

  it("should return null if the user does not exist", async () => {
    const nonExistingUserId = 99999;

    const result = await verifyUser(nonExistingUserId, connection);

    expect(result).toBeNull();
  });
});
