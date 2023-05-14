import { tRPC_Auth, tRPC_handleError } from "@app/Lib/tRPC";
import type { IndexLoaderData } from "@app/Page/blueprint/list/Loader";
import { ERoles } from "@app/Shared/Enum/ERoles";
import { LoginRule, validateLogin } from "@applib/loaderHelper";
import type { BlueprintData } from "@server/MongoDB/DB_Blueprints";
import type { LoaderFunction } from "react-router-dom";
import { json } from "react-router-dom";

const loader: LoaderFunction = async( { params, request } ) => {
	const result = await validateLogin( { params, request }, LoginRule.LoggedIn, "/error/401", ERoles.admin );
	if( result instanceof Response ) {
		return result;
	}
	const Blueprints = await tRPC_Auth.blueprints.adminBlueprints.query( { limit: 10 } ).catch( tRPC_handleError );
	let blueprints: BlueprintData[] = [];
	let totalBlueprints = 0;
	if( Blueprints ) {
		blueprints = Blueprints.blueprints;
		totalBlueprints = Blueprints.totalBlueprints;
	}

	return json<IndexLoaderData>( { ...result, blueprints, totalBlueprints } );
};

export { loader };

