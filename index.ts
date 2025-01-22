import { getAllUsers, getTotalUsers } from "./databaseAccessLayer";

getTotalUsers().then((users)=>console.log(users))
