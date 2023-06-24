import { env } from "@/env";
import type { KBotModApiResult } from "@/types/KBotApi";
import type { Mods } from "@prisma/client";
import { prisma } from './../server/db';


class KBotApi {
	private modUrl = 'https://kbot2.kyrium.space/api/v1/mod/';

	async getMods( modRefs: string | string[] ): Promise<Mods[]> {
		const mods = Array.isArray( modRefs ) ?  modRefs : [ modRefs ];
		if( !mods.length ) {
			return [];
		}
		return await this.getModsInternal( mods );
	}

	private async getModsInternal( modRefs: string[] ): Promise<Mods[]> {
		const foundMods = await prisma.mods.findMany( { where: { modRef: { in: modRefs } } } );
		const invalidModsDatas = modRefs.filter( modRef => !foundMods.find( mod => mod.modRef === modRef && mod.updatedAt.valueOf() >= ( Date.now() - 24 * 60 * 60 * 1000 ) ) );

		if( invalidModsDatas.length ) {
			const apiResult = await fetch( this.modUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( { modRefs } ),
				next: { revalidate: 60 * 60 * 24 }
			} )
				.then( response => response.json() )
				.then( response => response as KBotModApiResult )
				.then( response => {
					if( response.success ) {
						return response.mods;
					}
					throw new Error( "response was not success" );
				} )
				.catch( console.error );

			if( apiResult?.length ) {
				await Promise.all( apiResult.map( async modData => {
					const data = {
						logo: modData.logo,
						modRef: modData.mod_reference,
						name: modData.name,
						shortDescription: modData.short_description,
						views: modData.views,
						downloads: modData.downloads,
						hidden: modData.hidden,
						sourceUrl: modData.source_url
					};
					if( await prisma.mods.findUnique( { where: { modRef: modData.mod_reference } } ) ) {
						console.info( `Mod '${ modData.name }' already exists. Updating...}` );
						await prisma.mods.update( { where: { modRef: modData.mod_reference }, data } );
					} else {
						console.info( `Mod '${ modData.name }' creating...}` );
						await prisma.mods.create( { data } );
					}
				} ) );
			}
		}

		return !invalidModsDatas.length ? ( await prisma.mods.findMany( { where: { modRef: { in: modRefs } } } ) ) : foundMods;
	}
}

const globalForKbotApi = globalThis as unknown as{
	kbotApi: KBotApi | undefined
};

export const kbotApi =  globalForKbotApi.kbotApi ?? new KBotApi();

if( env.NODE_ENV !== "production" ) {
	globalForKbotApi.kbotApi = kbotApi;
}

