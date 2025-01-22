import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfigLocal = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: process.env.DB_MULTIPLE_STATEMENTS === 'true', 
  namedPlaceholders: process.env.DB_NAMED_PLACEHOLDERS === 'true',
};

const database = mysql.createPool(dbConfigLocal);

export default database; 
