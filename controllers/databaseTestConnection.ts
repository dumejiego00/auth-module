import dotenv from 'dotenv';
import { createConnection, Connection } from 'mysql2/promise';

dotenv.config();

let connection: Connection | null = null;

export const getTestConnection = async (): Promise<Connection> => {
  if (!connection) {
    connection = await createConnection({
      host: process.env.DB_LOCAL_HOST as string,
      user: process.env.DB_LOCAL_USER as string,
      password: process.env.DB_LOCAL_PASSWORD as string,
      database: process.env.DB_LOCAL_TEST_DATABASE as string,
      multipleStatements: process.env.DB_LOCAL_MULTIPLE_STATEMENTS === "true",
      namedPlaceholders: process.env.DB_LOCAL_NAMED_PLACEHOLDERS === "true",
    });
  }
  return connection;
};

export const closeTestConnection = async (): Promise<void> => {
  if (connection) {
    await connection.end(); 
    connection = null;  
  }
};

export const resetTestDatabase = async (): Promise<void> => {
  if (connection) {
    await connection.query('TRUNCATE TABLE users');
  }
};
