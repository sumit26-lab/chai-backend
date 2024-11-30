
import mongoose,{Schema} from "mongoose";

const subscriptionSchema= new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //One whos can subscribing
        ref:"User"

    },
    channel:{
        type:Schema.Types.ObjectId, //one to whom 'subscribering is subscribing
        ref:"User"
    }
},{timestamps:true}) 

export default mongoose.model('subscription',subscriptionSchema)