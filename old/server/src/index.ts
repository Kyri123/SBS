import * as path            from "path";
import { Server }           from "socket.io";
import {
	IEmitEvents,
	IListenEvents
}                           from "@shared/Types/SocketIO";
import http                 from "http";
import express              from "express";
import { InstallRoutings }  from "./Routings/InitRouter";
import process              from "process";
import * as mongoose        from "mongoose";
import "@kyri123/k-javascript-utils/lib/useAddons";
import fs                   from "fs";
import {
	BC,
	SystemLib_Class
}                           from "./Lib/System.Lib";
import DB_UserAccount       from "./MongoDB/DB_UserAccount";
import { ERoles }           from "@shared/Enum/ERoles";
import fileUpload           from "express-fileupload";
import { TaskManagerClass } from "./Tasks/TaskManager";

global.__BaseDir = __dirname;
global.__MountDir = path.join( process.cwd(), "mount" );
( !fs.existsSync( path.join( __MountDir, "Logs" ) ) ) && fs.mkdirSync( path.join( __MountDir, "Logs" ), { recursive: true } );
global.__LogFile = path.join( __MountDir, "Logs", `${ Date.now() }.log` );
global.__BlueprintDir = path.join( __MountDir, "Blueprints" );
( !fs.existsSync( __BlueprintDir ) ) && fs.mkdirSync( __BlueprintDir, { recursive: true } );

global.SystemLib = new SystemLib_Class();

global.Api = express();
global.HttpServer = http.createServer( global.Api );

global.SocketIO = new Server<IListenEvents, IEmitEvents>( global.HttpServer, {
	path: "/api/v1/io/",
	cors: {
		origin: "*",
		methods: [ "GET", "POST", "PUT", "PATCH", "DELETE" ],
		credentials: false
	}
} );

Api.use( express.json() );
Api.use( express.urlencoded( { extended: true } ) );
Api.use( fileUpload( {
	useTempFiles: true,
	tempFileDir: "/tmp/"
} ) );
Api.use( express.static( path.join( __BaseDir, "../..", "build" ), { extensions: [ "js" ] } ) );

Api.use( function( req, res, next ) {
	res.setHeader( "Access-Control-Allow-Origin", "*" );
	res.setHeader( "Access-Control-Allow-Methods", "GET, POST" );
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type"
	);
	res.setHeader( "Access-Control-Allow-Credentials", "true" );
	next();
} );

mongoose
	.connect(
		`mongodb://${ process.env.MONGODB_HOST }:${ process.env.MONGODB_PORT }`,
		{
			user: process.env.MONGODB_USER,
			pass: process.env.MONGODB_PASSWD,
			dbName: process.env.MONGODB_DATABASE
		}
	)
	.then( async() => {
		SystemLib.Log( "start", "Connected to mongodb..." );
		SystemLib.Log( "Revalidate", "MongoDB" );
		for ( const DB of fs.readdirSync( path.join( __BaseDir, "MongoDB" ) ) ) {
			const File = path.join( __BaseDir, "MongoDB", DB );
			const Stats = fs.statSync( File );
			if ( Stats.isFile() && DB !== "DB_UserAccount.ts" ) {
				const DBImport = await import( File );
				if ( DBImport.Revalidate ) {
					SystemLib.Log( "Revalidate", `Schema for${ BC( "Cyan" ) }`, DB.toString().replace( ".ts", "" ) );
					await DBImport.Revalidate();
				}
			}
		}

		global.DownloadIPCached = [];
		// Sockets need to connect on a room otherwise we will not be able to send messages
		SocketIO.on( "connection", function( socket ) {
			const query = socket.handshake.query;
			const roomName = query.roomName;
			if ( !roomName || Array.isArray( roomName ) ) {
				socket.disconnect( true );
				return;
			}
			socket.join( roomName as string );
		} );

		SystemLib.Log( "start", "Connected... Start API and SOCKETIO" );

		global.Router = express.Router();
		await InstallRoutings( path.join( __BaseDir, "Routings/Router" ) );

		Api.use( Router );
		Api.get( "*", function( req, res ) {
			res.sendFile( path.join( __BaseDir, "../..", "build", "index.html" ) );
		} );

		if ( !await DB_UserAccount.findOne() ) {
			const NewUser = new DB_UserAccount();
			NewUser.email = "admin@kmods.de";
			NewUser.username = "Kyrium";
			NewUser.role = ERoles.admin;
			NewUser.setPassword( "123456" );
			SystemLib.LogWarning( "start", " Default user was created. Kyrium | 23456 | admin@kmods.de" );
			await NewUser.save();
		}

		global.TaskManager = new TaskManagerClass();
		await TaskManager.Init();

		HttpServer.listen( parseInt( process.env.HTTPPORT! ), async() =>
			SystemLib.Log( "start",
				"API listen on port",
				process.env.HTTPPORT
			)
		);
	} );