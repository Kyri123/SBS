import { useAuth } from "@hooks/useAuth";
import { useBlueprint } from "@hooks/useBlueprint";
import { usePageTitle } from "@kyri123/k-reactutils";
import { ERoles } from "@shared/Enum/ERoles";
import type { FunctionComponent } from "react";
import * as Icon from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import {
	Link,
	Navigate,
	useParams
} from "react-router-dom";

const Component: FunctionComponent = () => {
	const { id } = useParams();
	const { loggedIn, user } = useAuth();
	const {
		IsOwner,
		ToggleBlacklist,
		Blueprint,
		BlueprintValid,
		AllowToLike,
		ToggleLike,
		AllowToEdit,
		Mods,
		Tags,
		BlueprintData
	} = useBlueprint( id! );
	usePageTitle( `SBS - Blueprint` );

	if( !BlueprintValid ) {
		return (
			<></>
		);
	}

	if( Blueprint.blacklisted ) {
		return (
			<Navigate to="/" />
		);
	}

	return (
		<div className="p-0 w-100">
			<Card className="mb-3">
				<Card.Header className="d-flex p-0">
					<h3 className="py-1 pt-2 px-3 flex-1">{ Blueprint.name }</h3>
					<Button disabled={ !AllowToLike }
					        variant={ loggedIn ? ( !Blueprint.likes.includes( user.Get._id ) ? "danger" : "success" ) : "dark" }
					        onClick={ ToggleLike } type="button" className="rounded-none rounded-tr-2xl px-4">
						{ !Blueprint.likes.includes( user.Get._id ) ?
							<Icon.BsFillHeartbreakFill className="me-2" /> :
							<Icon.BsFillHeartFill className="me-2" /> } { Blueprint.likes.length }
					</Button>
				</Card.Header>

				<Card.Header style={ {
					backgroundImage: `url('/api/v1/image/${ Blueprint._id }')`,
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover",
					height: 350,
					backgroundPosition: "center"
				} }></Card.Header>

				<Card.Body className="pb-0 relative">
					<ReactMarkdown>{ Blueprint.description.length > 200 ? Blueprint.description.slice( 0, 200 ) + "..." : Blueprint.description }</ReactMarkdown>
					<Ribbon innerClassName={ Blueprint.mods.length >= 1 ? "text-bg-danger" : "text-bg-success" }>{ Blueprint.mods.length >= 1 ? Lang.General.IsModded : Lang.General.IsVanilla }</Ribbon>
				</Card.Body>

				<Card.Body className="p-0 border-t">
					<Table striped border={ 1 }
					       className="my-0 table-bordered border-b-0 border-l-0 border-r-0">
						<tbody>
							<tr>
								<td>{ Lang.MyBlueprint.CreatedAt }</td>
								<td>{ new Date( Blueprint.createdAt! ).toLocaleString() }</td>
							</tr>
							<tr>
								<td>{ Lang.ShowBlueprint.ObjectCount }</td>
								<td>{ BlueprintData?.objects.length }</td>
							</tr>
							<tr>
								<td className="w-25">{ Lang.CreateBlueprint.BlueprintSize }</td>
								<td className="w-75">{ Blueprint.DesignerSize }</td>
							</tr>
							<tr>
								<td>{ Lang.CreateBlueprint.Mods }</td>
								<td>{ Mods.map( R => (
									<Link key={ R._id } to={ `https://ficsit.app/mod/${ R.mod_reference }` }
								      target="_blank"
								      className="btn btn-secondary m-1 p-0">
										<img onError={ E => E.currentTarget.src = "/images/default/unknown.png" }
									     alt={ R.mod_reference } src={ R.logo }
									     className="w-10 h-10 rounded-l-md" /><span className="px-2 pe-3">{ R.name }</span>
									</Link>
								) ) }</td>
							</tr>
							<tr>
								<td>{ Lang.CreateBlueprint.Tags }</td>
								<td>{ Tags.map( R => <Badge key={ R._id } className="me-2"
							                            bg="secondary">{ R.DisplayName }</Badge> ) }</td>
							</tr>
						</tbody>
					</Table>
				</Card.Body>

				<Card.Footer className="p-0">
					<ButtonGroup className="h-100 w-100">
						{ AllowToEdit &&
							<Link to={ `/blueprint/edit/${ Blueprint._id }` }
							      className="btn rounded-top-0 btn-secondary">
								<Icon.BsGearFill />
							</Link> }
						{ ( user.HasPermission( ERoles.moderator ) || IsOwner ) &&
							<Button variant="danger" onClick={ async() => {
								await ToggleBlacklist();
							} }
							        className="rounded-top-0">
								<Icon.BsTrashFill />
							</Button> }
						<Link to={ `/api/v1/download/${ Blueprint._id }` } target="_blank"
						      className="btn rounded-top-0 btn-success">
							<Icon.BsDownload /> { Blueprint.downloads }
						</Link>
					</ButtonGroup>
				</Card.Footer>
			</Card>
		</div>
	);
};

export {
	Component
};

