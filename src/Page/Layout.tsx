import Foother from "@comp/Main/Foother";
import TopNav from "@comp/Main/TopNav";
import AuthContext from "@context/AuthContext";
import DataContext from "@context/DataContext";
import type { LayoutLoaderData } from "@page/Loader";
import { User } from "@shared/Class/User.Class";
import type { FunctionComponent } from "react";
import {
	Outlet,
	useLoaderData
} from "react-router-dom";


const Component: FunctionComponent = () => {
	const { loggedIn, user, tags, mods } = useLoaderData() as LayoutLoaderData;

	return (
		<AuthContext.Provider value={ {
			loggedIn,
			user: new User( user.JsonWebToken )
		} }>
			<DataContext.Provider value={ { tags, mods } }>
				<div className="flex flex-col h-screen justify-between">
					<TopNav />
					<div className="container py-3 px-2 md:px-0 md:mx-auto mb-auto">
						<Outlet />
					</div>
					<Foother />
				</div>
			</DataContext.Provider>
		</AuthContext.Provider>
	);
};

export {
	Component
};

