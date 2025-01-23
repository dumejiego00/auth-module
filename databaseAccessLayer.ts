import database from "./databaseConnection";
import { RowDataPacket, ResultSetHeader, Connection } from "mysql2/promise";
import bcrypt from 'bcrypt';
import validator from 'validator';

// Define a type for user data
export interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: Date;
}

export async function getConnection() {
  const connection = await database.getConnection();
  return connection;
}

// Fetch a user by ID
export async function getUserById(userId: number): Promise<User | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE id = :userId;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery, { userId });
    return results[0] || null;
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Fetch a user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE username = :username;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery, { username });
    return results[0] || null;
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

export async function getUserByEmail(
  email: string,
  connection: Connection
): Promise<User | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE email = :email;
  `;
  try {
    const [results] = await connection.query<RowDataPacket[]>(sqlQuery, { email });
    // Cast the first result to a User type
    const user = results[0] ? (results[0] as User) : null;
    return user;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}

export async function checkIfUsernameExist(username: string, connection: Connection): Promise<void> {
  try {
    const [existingUsername] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = :username', 
      { username }
    );
    if (existingUsername.length > 0) {
      throw new Error('Username is already in use by a different user');
    }
  } catch (err) {
    console.error("Error checking if username exists:", err);
    throw err; 
  }
}

export async function checkIfEmailExist(email: string, connection: Connection): Promise<void> {
  try {
    const [existingEmail] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = :email',
      { email }
    );
    if (existingEmail.length > 0) {
      throw new Error('Email is already in use by a different user');
    }
  } catch (err) {
    console.error('Error checking if email exists:', err);
    throw err;
  }
}

export async function createUser(
  username: string,
  email: string,
  password: string,
  connection: Connection 
): Promise<{ id: number; username: string; email: string }> {
  try {
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await checkIfEmailExist(email, connection); 
    await checkIfUsernameExist(username, connection);

    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO users (username, email, password)
        VALUES (:username, :email, :password)
      `,
      { username, email, password: hashedPassword }
    );

    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
