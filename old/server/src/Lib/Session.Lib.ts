import { MO_UserAccount } from "@shared/Types/MongoDB";
import DB_SessionToken    from "@server/MongoDB/DB_SessionToken";
import * as jwt           from "jsonwebtoken";

export async function CreateSession( User : Partial<MO_UserAccount> ) : Promise<string | undefined> {
	delete User.__v;
	delete User.salt;
	delete User.hash;
	try {
		const Token = jwt.sign( User, process.env.JWTToken || "", {
			expiresIn: "7d"
		} );
		const Decoded = jwt.verify( Token, process.env.JWTToken || "" ) as jwt.JwtPayload;
		if ( Decoded ) {
			await DB_SessionToken.deleteMany( { expire: { $lte: new Date() } } );
			const session = await DB_SessionToken.create( {
				token: Token,
				userid: User._id,
				expire: new Date( ( Decoded.exp || 0 ) * 1000 )
			} );
			return session.token;
		}
	}
	catch ( e ) {
		if ( e instanceof Error ) {
			SystemLib.LogError( "api", e.message );
		}
	}
	return undefined;
}