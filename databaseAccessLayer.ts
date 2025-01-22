import database from "./databaseConnection";
import { RowDataPacket, ResultSetHeader  } from "mysql2";
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

// Helper function to get connection and release it
export async function getConnection() {
  const connection = await database.getConnection();
  return connection;
}

// Fetch all users
export async function getAllUsers(): Promise<User[] | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery);
    return results;
  } catch (err) {
    console.error("Error fetching all users:", err);
    return null;
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
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

// Fetch a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE email = :email;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery, { email });
    return results[0] || null;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Get total users
export async function getTotalUsers(): Promise<number> {
  const sqlQuery = `
    SELECT COUNT(*) AS total_users
    FROM users;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<RowDataPacket[]>(sqlQuery);  // Use RowDataPacket[]
    return results[0]?.total_users || 0;
  } catch (err) {
    console.error("Error counting users:", err);
    return 0;
  } finally {
    if (connection) connection.release();
  }
}

// Fetch verified users
export async function getVerifiedUsers(): Promise<User[] | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE is_verified = TRUE;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery);
    return results;
  } catch (err) {
    console.error("Error fetching verified users:", err);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Fetch admin users
export async function getAdminUsers(): Promise<User[] | null> {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE is_admin = TRUE;
  `;
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query<User[]>(sqlQuery);
    return results;
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Delete user by ID
export async function deleteUserById(userId: number): Promise<boolean> {
  const sqlQuery = `
    DELETE FROM users
    WHERE id = :userId;
  `;
  let connection;
  try {
    connection = await getConnection();
    await connection.query(sqlQuery, { userId });
    return true;
  } catch (err) {
    console.error("Error deleting user:", err);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Check if username exists
export async function checkIfUsernameExist(username: string): Promise<void> {
  let connection;
  try {
    connection = await getConnection();
    const [existingUsername] = await connection.query<User[]>(
      'SELECT * FROM users WHERE username = :username', 
      { username }
    );
    if (existingUsername.length > 0) {
      throw new Error('Username is already in use by a different user');
    }
  } catch (err) {
    console.error("Error checking if username exists:", err);
  } finally {
    if (connection) connection.release();
  }
}

// Check if email exists
export async function checkIfEmailExist(email: string): Promise<void> {
  let connection;
  try {
    connection = await getConnection();
    const [existingEmail] = await connection.query<User[]>(
      'SELECT * FROM users WHERE email = :email', 
      { email }
    );
    if (existingEmail.length > 0) {
      throw new Error('Email is already in use by a different user');
    }
  } catch (err) {
    console.error("Error checking if email exists:", err);
  } finally {
    if (connection) connection.release();
  }
}

// Create a new user
export async function createUser(
  username: string,
  email: string,
  password_hash: string
): Promise<{ id: number; username: string; email: string }> {
  let connection;
  try {
    
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    connection = await getConnection();
    await checkIfEmailExist(email);
    await checkIfUsernameExist(username);

    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO users (username, email, password_hash)
        VALUES (:username, :email, :password_hash)
      `,
      { username, email, password_hash: hashedPassword }
    );

    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}
