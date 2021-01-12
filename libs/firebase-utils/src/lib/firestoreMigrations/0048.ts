import { Firestore } from '@blockframes/firebase-utils';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { Territory } from '@blockframes/utils/static-model';
import { runChunks } from '../firebase-utils';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore'

const coteDIvoire = 'cote-d-ivoire' as Territory;
const antartica = 'antartica' as Territory;

export async function upgrade(db: Firestore) {
    const movies = await db.collection('movies').get();
    const orgs = await db.collection('orgs').get();

    const patchKey = (country: Territory) => {
        if(country === coteDIvoire) {
            return 'ivory-coast-cote-d-ivoire'
        } else if (country === antartica) {
            return 'antarctica'
        } 
        return country
    }

    await runChunks(movies.docs, async (movie) => {
        const data = movie.data() as MovieDocument;

        if(data.originCountries.includes(coteDIvoire) || data.originCountries.includes(antartica)) {
            data.originCountries = data.originCountries.map(patchKey)
        }

        if(data?.originalRelease.length) {
            data.originalRelease = data.originalRelease.map(release => {
             return {
                country: patchKey(release.country),
                 ...release
                }  
            })
        }

        if(data?.shooting?.locations.length) {
            data.shooting.locations = data.shooting.locations.map(location => {
                return {
                    country:  patchKey(location.country),
                    ...location
                }
            })
        }

        const stakeholdersKeys = Object.keys(data?.stakeholders);

        if(stakeholdersKeys.length) {
            stakeholdersKeys.forEach(stakeholder => {
                data.stakeholders[stakeholder] = data.stakeholders[stakeholder].map(holder => {
                    return {
                        countries: holder.countries.map(patchKey),
                        ...holder
                    }
                })
            })
        }
       await movie.ref.set(data);
    })

    return runChunks(orgs.docs, async (org) => {
        const data = org.data() as OrganizationDocument;

        const addressesKeys = Object.keys(data.addresses);

        if(addressesKeys.length) {
            addressesKeys.forEach(address => {
                data.addresses[address].country = patchKey(data.addresses[address].country);
            })
        }

      await org.ref.set(data);
    })
}
