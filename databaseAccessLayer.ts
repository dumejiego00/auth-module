import database from "./databaseConnection";
import { RowDataPacket, ResultSetHeader, Connection } from "mysql2/promise";
import bcrypt from 'bcrypt';
import validator from 'validator';

export async function getConnection() {
  const connection = await database.getConnection();
  return connection;
}

export async function getUserById(
  userId: number,
  connection: Connection 
): Promise<RowDataPacket | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE id = :userId;
  `;
  try {
    const [results] = await connection.query<RowDataPacket[]>(sqlQuery, { userId });
    return results[0] || null; 
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    return null;
  }
}

export async function getUserByUsername(username: string, connection: Connection): Promise<RowDataPacket | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE username = :username;
  `;
  try {
    const [results] = await connection.query<RowDataPacket[]>(sqlQuery, { username });
    return results[0] || null;
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return null;
  }
}

export async function getUserByEmail(
  email: string,
  connection: Connection
): Promise<RowDataPacket | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE email = :email;
  `;
  try {
    const [results] = await connection.query<RowDataPacket[]>(sqlQuery, { email });
    return results[0] || null; // Directly return the first result or null if no result
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
