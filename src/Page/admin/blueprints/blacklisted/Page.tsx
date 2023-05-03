import type { FunctionComponent } from "react";
import {
	useContext,
	useEffect,
	useState
}                                 from "react";
import { Table }                  from "react-bootstrap";
import type { MO_Blueprint }      from "@shared/Types/MongoDB";
import { API_QueryLib }           from "@applib/Api/API_Query.Lib";
import { EApiQuestionary }        from "@shared/Enum/EApiPath";
import LangContext                from "@context/LangContext";
import BlueprintTableRowAdmin     from "@comp/Blueprints/BlueprintTableRowAdmin";
import { useAuth }                from "@hooks/useAuth";

const Component : FunctionComponent = () => {
	const { Lang } = useContext( LangContext );
	const { user } = useAuth();
	const [ Blueprints, setBlueprints ] = useState<MO_Blueprint[]>( [] );

	const DoQuery = () => {
		API_QueryLib.Qustionary<MO_Blueprint>( EApiQuestionary.blueprints, {
			Filter: { blacklisted: true },
			Options: { sort: { createdAt: 1 } }
		} )
			.then( R => {
				if ( R && R.Success && R.Data ) {
					setBlueprints( R.Data );
				}
			} );
	};

	useEffect( () => {
		DoQuery();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ user.Get._id ] );

	return (
		<Table striped bordered hover size="sm" variant="dark">
			<thead>
			<tr>
				<th colSpan={ 7 }>
					<h3 className="p-2">{ Lang.Navigation.Admin_BlacklistedBlueprints }</h3>
				</th>
			</tr>
			<tr>
				<th className={ "px-2 text-center" }>{ Lang.MyBlueprint.BP }</th>
				<th className={ "px-3 text-center" }>{ Lang.MyBlueprint.CreatedAt }</th>
				<th className={ "px-3 text-center" }>{ Lang.MyBlueprint.Downloads }</th>
				<th className={ "px-3 text-center" }>{ Lang.MyBlueprint.Likes }</th>
				<th className={ "px-3 text-center" }>{ Lang.MyBlueprint.Mods }</th>
				<th className={ "px-3 text-center" }>{ Lang.MyBlueprint.Tags }</th>
				<th className={ "px-2 text-center" }>{ Lang.MyBlueprint.Actions }</th>
			</tr>
			</thead>
			<tbody>
			{ Blueprints.map( R => <BlueprintTableRowAdmin Data={ R } key={ R._id } onToggled={ DoQuery }/> ) }
			</tbody>
		</Table>
	);
};

export {
	Component
};
