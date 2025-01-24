import { getUserByEmail, createUser, getUserById, verifyUser } from "./databaseAccessLayer";
import { getTestConnection } from "./databaseTestConnection";
import { getConnection } from "./databaseAccessLayer";

async function testCreateUser() {
//   const connection = await getTestConnection();
  const connection = await getConnection();
  return await verifyUser(4, connection);
}

testCreateUser().then(user=>console.log(user)).catch((err) => {
  console.error('Error:', err);
});
