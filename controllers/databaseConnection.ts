import mysql, { Pool, PoolOptions } from "mysql2/promise";

const isFreeDB = process.env.DB_ENV || false; 

const dbConfigFreeDB: PoolOptions = {
  host: process.env.DB_FREE_HOST as string,
  user: process.env.DB_FREE_USER as string,
  password: process.env.DB_FREE_PASSWORD as string,
  database: process.env.DB_FREE_DATABASE as string,
  multipleStatements: process.env.DB_FREE_MULTIPLE_STATEMENTS === "true",
  namedPlaceholders: process.env.DB_FREE_NAMED_PLACEHOLDERS === "true",
};

const dbConfigLocal: PoolOptions = {
  host: process.env.DB_LOCAL_HOST as string,
  user: process.env.DB_LOCAL_USER as string,
  password: process.env.DB_LOCAL_PASSWORD as string,
  database: process.env.DB_LOCAL_DATABASE as string,
  multipleStatements: process.env.DB_LOCAL_MULTIPLE_STATEMENTS === "true",
  namedPlaceholders: process.env.DB_LOCAL_NAMED_PLACEHOLDERS === "true",
};

const database: Pool = mysql.createPool(isFreeDB ? dbConfigFreeDB : dbConfigLocal);

export default database;