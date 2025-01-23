import { getUserByEmail, createUser } from "./databaseAccessLayer";
import { getTestConnection } from "./databaseTestConnection";
import { getConnection } from "./databaseAccessLayer";

async function testCreateUser() {
//   const connection = await getTestConnection();
  const connection = await getConnection();
  return await getUserByEmail('danumejiego@gmail.com', connection);
}

testCreateUser().then(user=>console.log(user)).catch((err) => {
  console.error('Error:', err);
});
