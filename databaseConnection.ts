import mysql, { Pool, PoolOptions } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfigLocal: PoolOptions = {
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  multipleStatements: process.env.DB_MULTIPLE_STATEMENTS === "true",
  namedPlaceholders: process.env.DB_NAMED_PLACEHOLDERS === "true",
};

const database: Pool = mysql.createPool(dbConfigLocal);

export default database;
