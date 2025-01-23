import { getUserByEmail, createUser, getUserById } from "./databaseAccessLayer";
import { getTestConnection } from "./databaseTestConnection";
import { getConnection } from "./databaseAccessLayer";

async function testCreateUser() {
//   const connection = await getTestConnection();
  const connection = await getConnection();
  return await getUserById(3, connection);
}

testCreateUser().then(user=>console.log(user)).catch((err) => {
  console.error('Error:', err);
});
