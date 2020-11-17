import { app, App, getOrgModuleAccess } from "@blockframes/utils//apps";
import { movieConfig } from './index-configs/movie-index.config';
import { orgBaseConfig } from './index-configs/org-index.config';
import { userBaseConfig } from './index-configs/user-index.config';
import { setIndexConfiguration, clearIndex, indexBuilder, algoliaClientObject, hasAcceptedMovies } from './helper.utils';
import { loadAdminServices, getCollectionInBatches, getDocument } from '@blockframes/firebase-utils';
import { OrganizationDocument, orgName, findOrgAppAccess } from '@blockframes/organization/+state';
import { Campaign } from '@blockframes/campaign/+state'
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { PublicUser } from '@blockframes/user/+state';
import { AlgoliaRecordMovie, AlgoliaRecordOrganization, AlgoliaRecordUser } from "./algolia.interfaces";
import { Language } from "@blockframes/utils/static-model";

// ------------------------------------
//           ORGANIZATIONS
// ------------------------------------

export async function upgradeAlgoliaOrgs(appConfig?: App) {
    if (!appConfig) {
        const promises = app.map(upgradeAlgoliaOrgs);
        await Promise.all(promises);
    } else {

        await setIndexConfiguration(algoliaClientObject.indexNameOrganizations[appConfig], orgBaseConfig, process.env['ALGOLIA_API_KEY']);
        await clearIndex(algoliaClientObject.indexNameOrganizations[appConfig], process.env['ALGOLIA_API_KEY']);

        const { db } = loadAdminServices();
        const orgsIterator = getCollectionInBatches<OrganizationDocument>(db.collection('orgs'), 'id', 300)
        for await (const orgs of orgsIterator) {

            for (const org of orgs) {
                if (await hasAcceptedMovies(org)) {
                    org['hasAcceptedMovies'] = true;
                }
            }

            const promises = orgs.map(org => storeSearchableOrg(org, process.env['ALGOLIA_API_KEY']));

            await Promise.all(promises);
            console.log(`chunk of ${orgs.length} orgs processed...`);
        }

        console.log('Algolia Orgs index updated with success !');
    }
}

export async function upgradeAlgoliaMovies(appConfig?: App) {

    if (!appConfig) {
        const promises = app.map(upgradeAlgoliaMovies);
        await Promise.all(promises);
    } else {

        // reset config, clear index and fill it up from the db (which is the only source of truth)
        const config = movieConfig(appConfig)

        await setIndexConfiguration(algoliaClientObject.indexNameMovies[appConfig], config, process.env['ALGOLIA_API_KEY']);
        await clearIndex(algoliaClientObject.indexNameMovies[appConfig], process.env['ALGOLIA_API_KEY']);

        const { db } = loadAdminServices();
        const moviesIterator = getCollectionInBatches<MovieDocument>(db.collection('movies'), 'id', 300);

        for await (const movies of moviesIterator) {
            const promises = movies.map(async movie => {
                try {

                    const orgsDocs = await Promise.all(movie.orgIds.map(id => db.doc(`orgs/${id}`).get()))

                    const orgs = orgsDocs.map(doc => doc.data() as OrganizationDocument)

                    if (!orgs.length) {
                        console.error(`Movie ${movie.id} is not part of any orgs`);
                    }

                    // TODO : here we might decide to arbitrary choose first org
                    /*    if (querySnap.size > 1) {
                         throw new Error(`Movie ${movie.id} is part of several orgs (${querySnap.docs.map(doc => doc.id).join(', ')})`);
                       } */

                    const org = orgs[0];
                    const organizationName = orgName(org);

                    if (appConfig === 'financiers') {
                        const campaign = await getDocument<Campaign>(`campaign/${movie.id}`);
                        if (campaign?.minPledge) {
                            movie['minPledge'] = campaign.minPledge;
                        }
                    }

                    await storeSearchableMovie(movie, organizationName, process.env['ALGOLIA_API_KEY'])
                } catch (error) {
                    console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
                    console.error(error);
                }
            });

            await Promise.all(promises);
            console.log(`chunk of ${movies.length} movies processed...`);
        }

        console.log('Algolia Movies index updated with success !');
    }
}

export async function upgradeAlgoliaUsers() {

    // reset config, clear index and fill it up from the db (which is the only source of truth)


    await setIndexConfiguration(algoliaClientObject.indexNameUsers, userBaseConfig, process.env['ALGOLIA_API_KEY']);
    await clearIndex(algoliaClientObject.indexNameUsers, process.env['ALGOLIA_API_KEY']);

    const { db } = loadAdminServices();
    const usersIterator = getCollectionInBatches<PublicUser>(db.collection('users'), 'uid', 300)
    for await (const users of usersIterator) {
        const promises = users.map(async user => {
            try {
                await storeSearchableUser(user, process.env['ALGOLIA_API_KEY']);
            } catch (error) {
                console.error(`\n\n\tFailed to insert a user ${user.uid} : skipping\n\n`);
                console.error(error);
            }
        });
        await Promise.all(promises);
        console.log(`chunk of ${users.length} users processed...`)
    }
    console.log('Algolia Users index updated with success !');
}
export function storeSearchableOrg(org: OrganizationDocument, adminKey?: string): Promise<any> {
    if (!algoliaClientObject.adminKey && !adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    const orgRecord: AlgoliaRecordOrganization = {
        objectID: org.id,
        name: orgName(org),
        appModule: getOrgModuleAccess(org),
        country: org.addresses.main.country,
        isAccepted: org.status === 'accepted',
        hasAcceptedMovies: org['hasAcceptedMovies'] ?? false
    };

    /* If a org doesn't have access to the app dashboard or marketplace, there is no need to create or update the index */
    const orgAppAccess = findOrgAppAccess(org)

    // Update algolia's index
    const promises = orgAppAccess.map(appName => indexBuilder(algoliaClientObject.indexNameOrganizations[appName], adminKey).saveObject(orgRecord));

    return Promise.all(promises)
}

// ------------------------------------
//               MOVIES
// ------------------------------------

export function storeSearchableMovie(
    movie: MovieDocument,
    organizationName: string,
    adminKey?: string
): Promise<any> {
    if (!algoliaClientObject.adminKey && !adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    try {

        const movieRecord: AlgoliaRecordMovie = {
            objectID: movie.id,

            // searchable keys
            title: {
                international: movie.title.international || '',
                original: movie.title.original,
            },
            directors: !!movie.directors ?
                movie.directors.map((director) => `${director.firstName} ${director.lastName}`) :
                [],
            keywords: !!movie.keywords ? movie.keywords : [],

            // facets
            genres: !!movie.genres ? movie.genres : [],
            originCountries: !!movie.originCountries ? movie.originCountries : [],
            languages: {
                original: !!movie.originalLanguages ? movie.originalLanguages : [],
                dubbed: !!movie.languages ?
                    Object.keys(movie.languages).filter(lang => movie.languages[lang]?.dubbed) as Language[] :
                    [],
                subtitle: !!movie.languages ?
                    Object.keys(movie.languages).filter(lang => movie.languages[lang]?.subtitle) as Language[] :
                    [],
                caption: !!movie.languages ?
                    Object.keys(movie.languages).filter(lang => movie.languages[lang]?.caption) as Language[] :
                    [],
            },
            status: !!movie.productionStatus ? movie.productionStatus : '',
            storeConfig: movie.storeConfig?.status || '',
            budget: movie.estimatedBudget || null,
            orgName: organizationName,
            storeType: movie.storeConfig?.storeType || null,
            originalLanguages: movie.originalLanguages,
            runningTime: {
                status: movie.runningTime.status,
                time: movie.runningTime.time
            },
            release: {
                status: movie.release.status,
                year: movie.release.year
            },
            banner: movie.banner,
            poster: movie.poster
        };

        /* App specific properties */
        if (movie.storeConfig.appAccess.financiers) {
            movieRecord['socialGoals'] = movie?.audience?.goals;
            movieRecord['minPledge'] = movie['minPledge'];
        }

        const movieAppAccess = Object.keys(movie.storeConfig.appAccess).filter(access => movie.storeConfig.appAccess[access]);

        const promises = movieAppAccess.map(appName => indexBuilder(algoliaClientObject.indexNameMovies[appName], adminKey).saveObject(movieRecord));

        return Promise.all(promises)

    } catch (error) {
        console.error(`\n\n\tFailed to format the movie ${movie.id} into an algolia record : skipping\n\n`);
        console.error(error);
        return new Promise(res => res(true));
    }
}

// ------------------------------------
//                USERS
// ------------------------------------

export function storeSearchableUser(user: PublicUser, adminKey?: string): Promise<any> {
    if (!algoliaClientObject.adminKey && !adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    try {
        const userRecord: AlgoliaRecordUser = {
            objectID: user.uid,
            email: user.email,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            avatar: user.avatar ?? '',
        };

        return indexBuilder(algoliaClientObject.indexNameUsers, adminKey).saveObject(userRecord);
    } catch (error) {
        console.error(`\n\n\tFailed to format the user ${user.uid} into an algolia record : skipping\n\n`);
        console.error(error);
        return new Promise(res => res(true));
    }
}
