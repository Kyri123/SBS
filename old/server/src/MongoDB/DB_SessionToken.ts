import * as mongoose           from "mongoose";
import { MO_UserAccountToken } from "@shared/Types/MongoDB";

const UserAccountSchema = new mongoose.Schema<MO_UserAccountToken>( {
	userid: { type: String, required: true },
	token: { type: String, required: true },
	expire: { type: Date, required: true }
}, { timestamps: true } );

export default mongoose.model<MO_UserAccountToken>( "SBS_UserAccountToken", UserAccountSchema );
export { UserAccountSchema };