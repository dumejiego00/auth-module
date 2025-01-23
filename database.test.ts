import { checkIfUsernameExist, checkIfEmailExist, createUser } from './databaseAccessLayer';
import { getTestConnection, closeTestConnection } from './databaseTestConnection';
import { Connection, RowDataPacket } from 'mysql2/promise';

describe('checkIfUsernameExist', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await getTestConnection();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await connection.query('TRUNCATE TABLE users');
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
    await connection.query('TRUNCATE TABLE users');
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
    await connection.query('TRUNCATE TABLE users');
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