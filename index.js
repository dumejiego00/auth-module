import database from "./databaseConnection.js"; 
import {
  getAllUsers,
  getTotalUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  checkIfUsernameExist,
  checkIfEmailExist,
} from "./databaseAccessLayer.js"; 

// checkIfEmailExist("jimmy123@gmail.com");

// async function printMySQLVersion() {
//   const sqlQuery = `
//     SHOW VARIABLES LIKE 'version';
//   `;

//   try {
//     const [results] = await database.query(sqlQuery);
//     console.log("Successfully connected to MySQL");
//     console.log(results[0]);
//     return true;
//   } catch (err) {
//     console.error("Error getting version from MySQL", err);
//     return false;
//   }
// }

// await printMySQLVersion();
