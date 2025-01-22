import database from './databaseConnection.js';

async function getAllUsers() {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users;
  `;

  try {
    const [results] = await database.query(sqlQuery);
    console.log(results);
    return results;
  } catch (err) {
    console.error("Error fetching all users:", err);
    return null;
  }
}

async function getUserById(userId) {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE id = :userId;
  `;

  try {
    const [results] = await database.query(sqlQuery, { userId });
    console.log('got user by id:', results[0]);
    return results[0];
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    return null;
  }
}

async function getUserByUsername(username) {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE username = :username;
  `;

  try {
    const [results] = await database.query(sqlQuery, { username });
    console.log('got user by username:', results[0])
    return results[0];
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return null;
  }
}


async function getUserByEmail(email) {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE email = :email;
  `;

  try {
    const [results] = await database.query(sqlQuery, { email });
    console.log(results[0])
    return results[0];
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}


async function getTotalUsers() {
  const sqlQuery = `
    SELECT COUNT(*) AS total_users
    FROM users;
  `;

  try {
    const [results] = await database.query(sqlQuery);
    console.log(results[0]?.total_users || 0)
    return results[0]?.total_users || 0;
  } catch (err) {
    console.error("Error counting users:", err);
    return 0;
  }
}

async function getVerifiedUsers() {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE is_verified = TRUE;
  `;

  try {
    const [results] = await database.query(sqlQuery);
    return results;
  } catch (err) {
    console.error("Error fetching verified users:", err);
    return null;
  }
}

async function getAdminUsers() {
  const sqlQuery = `
    SELECT id, email, username, is_verified, is_admin, created_at
    FROM users
    WHERE is_admin = TRUE;
  `;

  try {
    const [results] = await database.query(sqlQuery);
    return results;
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return null;
  }
}

async function deleteUserById(userId) {
  const sqlQuery = `
    DELETE FROM users
    WHERE id = :userId;
  `;

  try {
    await database.query(sqlQuery, { userId });
    return true;
  } catch (err) {
    console.error("Error deleting user:", err);
    return false;
  }
}

async function checkIfUsernameExist(username) {
  const [existingUsername] = await database.query('SELECT * FROM users WHERE username = :username', { username });

  if (existingUsername.length > 0) {
    throw new Error('Username is already in use by a different user');
  }
}

async function checkIfEmailExist(email) {
  const [existingEmail] = await database.query('SELECT * FROM users WHERE email = :email', { email });

  if (existingEmail.length > 0) {
    throw new Error('Email is already in use by a different user');
  }
}

async function createUser(username, email, password_hash) {
  try {
    await checkIfEmailExist(email);

    await checkIfUsernameExist(username);

    const [result] = await database.query(`
      INSERT INTO users (username, email, password_hash)
      VALUES (:username, :email, :password_hash)
    `, { username, email, password_hash });

    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getTotalUsers,
  getVerifiedUsers,
  getAdminUsers,
  deleteUserById,
  createUser,
  checkIfUsernameExist,
  checkIfEmailExist,
};
