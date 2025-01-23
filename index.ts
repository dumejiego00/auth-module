import { getAllUsers, getTotalUsers, createUser } from "./databaseAccessLayer";
import { getTestConnection } from "./databaseTestConnection";
import { getConnection } from "./databaseAccessLayer";

async function testCreateUser() {
//   const connection = await getTestConnection();
  const connection = await getConnection();
  await createUser('existinuser', 'another@exampe.com', 'password123', connection);
}

testCreateUser().catch((err) => {
  console.error('Error:', err);
});
