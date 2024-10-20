import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const Connect_db=async()=>{
    try{
     const connectionInstance= await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
     console.log('\n DB-Connection',connectionInstance.connection.host)

    }
    catch(error){
        console.log('error ConnectDb connection falid',error)
        process.exit(1)
    }

}
export default Connect_db