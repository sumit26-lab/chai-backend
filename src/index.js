import {configDotenv} from "dotenv";
import { app } from "./app.js";
import Connect_db from "./db/index.js";
configDotenv({
    path:"./.env"
})

Connect_db().then(db=>{
    app.listen(process.env.PORT,()=>console.log('server is Runing ',process.env.PORT))
    app.on('error',(error)=>{
        console.log('server is Error ',error)
        throw Error('will Server Error')

        })
}).catch(err=>console.log('mongodb connection faild !!!',err))